defmodule Stitch.Invitation do
  @moduledoc """
  Module in charge of handling team invitation actions.
  """
  use Ecto.Schema
  alias Ecto.Changeset
  import Ecto.{Changeset, Query}
  alias Stitch.Invitation.{SingleRoomGuestInvite, MultiRoomGuestInvite}
  alias Stitch.{Repo, Accounts.User, Team, Invitation, TeamAuthorization, GroupQueries}

  schema "invitations" do
    belongs_to :user, User
    belongs_to :team, Team
    field :invite_token, :string
    field :accepted, :boolean, default: false

    timestamps()
  end

  def changeset(struct, params) do
    invite_token = Stitch.Rand.token(32)

    struct
    |> cast(params, [:user_id, :team_id])
    |> validate_required([:user_id, :team_id])
    |> put_change(:invite_token, invite_token)
  end

  def accept_changeset(%Invitation{} = struct, params) do
    struct
    |> cast(params, [:accepted])
  end

  @doc """
  Creates an invitation to be a single-room guest for multiple emails.
  ## Examples
      iex> invite_as_single_room_guests(%User{...}, %Team{...}, %{emails: ["test@test.com"], group_id: 9000}})
      [%{"test@test.com" => {:ok, %Invitation{...}}}
  """
  def invite_as_single_room_guests(%User{} = inviter, %Team{} = team, params) do
    Enum.map(params["emails"], fn email ->
      invite_as_single_room_guest(inviter, team, %{"email" => email, "group_id" => params["group_id"]})
    end)
  end

  @doc """
  Creates an invitation to be a single-room guest.
  ## Examples
      iex> invite_as_single_room_guest(%Team{...}, %{email: "test@test.com", group_id: 9000})
      {:ok, %Invitation{...}}
  """
  @spec invite_as_single_room_guest(User.t, Team.t, map) :: {:ok, map} | {:error, Changeset.t | :group_not_found}
  def invite_as_single_room_guest(%User{} = inviter, %Team{id: team_id} = team, params) do
    with %Changeset{valid?: true} = invite <- SingleRoomGuestInvite.changeset(params),
         {:group, group} when not is_nil(group) <- {:group, GroupQueries.get_by_id(team, invite.changes.group_id)},
         email = invite.changes.email,
         user_params = %{email: email, groups_as_guest: [group.id], team_id: team_id, roles: ["single-room-guest"]},
         {:user, {:ok, user}} <- {:user, Repo.insert(User.team_invite_changeset(%User{}, user_params))},
         {:ok, invitation} = Repo.insert(Invitation.changeset(%Invitation{}, %{user_id: user.id, team_id: team_id})) do
      analytics_track_new_invitation(user, email)
      Invitation.resend_invitation(inviter.id, invitation.id)
      {:ok, Repo.preload(invitation, :user)}
    else
      %Changeset{valid?: false} = changeset -> {:error, changeset}
      {:group, nil} -> {:error, :group_not_found}
      {:user, {:error, _changeset} = error} -> error
    end
  end

  @doc """
  Creates an invitation to be a multple-room guest for multiple emails.
  ## Examples
      iex> invite_as_multi_room_guests(%User{...}, %Team{...}, %{emails: ["test@test.com"], group_ids: [9000]}})
      %{"test@test.com" => {:ok, %Invitation{...}}}
  """
  def invite_as_multi_room_guests(%User{} = inviter, %Team{} = team, params) do
    Enum.map(params["emails"], fn email ->
      invite_as_multi_room_guest(inviter, team, %{"email" => email, "group_id" => params["group_ids"]})
    end)
  end

  @doc """
  Creates an invitation to be a multi-room guest.
  ## Examples
      iex> invite_as_multi_room_guest(%User{...}, %Team{...}, %{email: "test@test.com", group_ids: [9000, 9001]})
      {:ok, %Invitation{...}}
  """
  @spec invite_as_multi_room_guest(User.t, Team.t, map) :: {:ok, map} | {:error, Changeset.t} | {:error, :invalid_groups, [group_id :: integer]}
  def invite_as_multi_room_guest(%User{} = inviter, %Team{id: team_id} = team, params) do
    with %Changeset{valid?: true} = invite <- MultiRoomGuestInvite.changeset(params),
         group_ids = invite.changes.group_ids,
         {:ok, _groups} <- validate_groups(team, group_ids),
         email = invite.changes.email,
         user_params = %{email: email, groups_as_guest: group_ids, team_id: team_id, roles: ["multi-room-guest"]},
         {:user, {:ok, user}} <- {:user, Repo.insert(User.team_invite_changeset(%User{}, user_params))},
         {:ok, invitation} = Repo.insert(Invitation.changeset(%Invitation{}, %{user_id: user.id, team_id: team_id})) do
      analytics_track_new_invitation(user, email)
      Invitation.resend_invitation(inviter.id, invitation.id)
      {:ok, Repo.preload(invitation, :user)}
    else
      %Changeset{valid?: false} = changeset -> {:error, changeset}
      {:error, :invalid_groups, _} = error -> error
      {:user, {:error, _changeset} = error} -> error
    end
  end

  defp validate_groups(%Team{} = team, group_ids) do
    groups = GroupQueries.get_by_ids(group_ids, %User{team_id: team.id})
    valid_group_ids = for group <- groups, do: group.id
    invalid_group_ids = group_ids -- valid_group_ids
    if invalid_group_ids == [] do
      {:ok, groups}
    else
      {:error, :invalid_groups, invalid_group_ids}
    end
  end

  @doc """
  Invites user to the team via email address. If pending account
  for team with same email exists it returns error.
  """
  def invite_to_team(user_id, email) do
    user = Repo.get(User, user_id)
    team = Repo.get(Team, user.team_id)
    if TeamAuthorization.can_send_invites?(user, team) do
      new_user_changeset = User.team_invite_changeset(%User{}, %{email: email, team_id: team.id})
      case Repo.insert(new_user_changeset) do
        {:error, _changeset} ->
          invited_user = Repo.get_by(User, email: email, team_id: team.id)

          case invited_user do
            nil -> {:error, "Email host is not supported."}
            invited_user ->
              case invited_user.onboarded do
                true -> {:error, "Email has already been registered."}
                false -> {:error, "Email has already been invited."}
              end
          end
        {:ok, new_user} ->
          invitation_changeset = Invitation.changeset(%Invitation{}, %{user_id: new_user.id, team_id: team.id})
          {:ok, invitation} = Repo.insert(invitation_changeset)
          analytics_track_new_invitation(user, email)
          Invitation.resend_invitation(user_id, invitation.id)
      end
    else
      {:error, "User unauthorized to create a new invitation."}
    end
  end

  defp analytics_track_new_invitation(user, email) do
    Stitch.Task.start(fn ->
      team_id = user.team_id
      team = Stitch.TeamQueries.get_by_id(team_id)
      active_users = Stitch.TeamQueries.list_active_users(team)
      properties = %{
        "first_name"   => user.first_name,
        "last_name"    => user.last_name,
        "email"        => email,
        "team_id"      => Integer.to_string(team.id),
        "team_name"    => team.name,
        "team_slug"    => team.slug,
        "active_users" => length(active_users)
      }
      Stitch.Analytics.track(user.id, "Team Invitation Sent", properties)
    end)
  end

  @doc """
  Returns a Stitch.Invitation struct given a valid invite_token
  parameter.
  """
  def get_by_invite_token(invite_token) when byte_size(invite_token) > 0 do
    query =
      from i in Invitation,
      where: i.invite_token == ^invite_token,
      preload: [:user]

    case Repo.one(query) do
      nil ->
        {:error, "Invitation does not exist."}
      invitation ->
        {:ok, invitation}
    end
  end
  def get_by_invite_token(_) do
    {:error, "Invite_token cannot be blank or nil."}
  end

  @doc """
  Accepts the invitation.
  """
  def accept(%Invitation{} = invitation) do
    invitation
    |> accept_changeset(%{accepted: true})
    |> Repo.update
  end

  @doc """
  Returns a list of Invitations associated with the team.
  """
  def list_pending_team_invitations(%Team{id: team_id}) do
    query =
      from i in Invitation,
      join: u in assoc(i, :user),
      where: i.team_id == ^team_id,
      where: i.accepted == ^false,
      preload: [user: u]

    Repo.all(query)
  end

  @doc """
  Resends invitation email to the user provided the invite hasn't
  been accepted yet.
  """
  def resend_invitation(user_id, invitation_id) do
    user = Repo.get(User, user_id)
    team = Repo.get(Team, user.team_id)
    if TeamAuthorization.can_send_invites?(user, team) do
      query =
        from i in Invitation,
        where: i.id == ^invitation_id,
        preload: [:user, :team]

      invitation = Repo.one(query)
      case invitation.accepted do
        true ->
          {:error, "This invitation has been accepted already."}
        false ->
          Invitation.Email.team_invitation("#{user.first_name} #{user.last_name}", invitation)
          |> Stitch.Mailer.deliver_later
          {:ok, invitation}
      end
    else
      {:error, "User unauthorized to resend invitation."}
    end
  end

  @doc """
  Deletes the invitation and the user associated to the invitation
  provided the invite hasn't been accepted yet.
  """
  def revoke_invitation(user_id, invitation_id) do
    user = Repo.get(User, user_id)
    team = Repo.get(Team, user.team_id)
    if TeamAuthorization.can_send_invites?(user, team) do
      query =
        from i in Invitation,
        where: i.id == ^invitation_id,
        preload: [:user, :team]
      invitation = Repo.one(query)
      case invitation.accepted do
        true ->
          {:error, "This invitation has been accepted already."}
        false ->
          Repo.delete(invitation.user)
          {:ok, invitation, invitation.user}
      end
    else
      {:error, "User unauthorized to revoke invitation."}
    end
  end

  @doc """
  Attempts to accept the invitation, and in case of success invites the user to the default group
  """
  def accept_and_complete_onboarding(invite_token, params) do
    result =
      Ecto.Multi.new
      |> Ecto.Multi.run(:invite, fn _ -> Invitation.get_by_invite_token(invite_token) end)
      |> Ecto.Multi.run(:accept, fn %{invite: invite} -> Stitch.Invitation.accept(invite) end)
      |> Ecto.Multi.run(:user, fn %{invite: invite} ->
        params = Map.put(params, "team_id", invite.team_id)
        case Stitch.Accounts.update_and_complete_user_onboarding(invite.user_id, params) do
          %User{} = user -> {:ok, user}
          error -> error
        end
      end)
      |> Repo.transaction

      case result do
        {:ok, %{user: %{groups_as_guest: []} = user}} -> # Regular users
          default_group = Stitch.GroupQueries.default_group(user)
          Stitch.Group.add_user(default_group, user)
          {:ok, %{user: user, groups: [default_group]}}
        {:ok, %{user: %{team_id: team_id, groups_as_guest: restricted_groups} = user}} -> # Guests
          groups = Stitch.GroupQueries.get_by_ids(restricted_groups, %User{team_id: team_id})
          for group <- groups do
            Stitch.Group.add_user(group, user)
          end
          {:ok, %{user: user, groups: groups}}
        {:error, _, error, _} ->
          {:error, error}
      end
  end
end
