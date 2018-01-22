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
  @spec invite_as_single_room_guest(User.t, Team.t, map) :: {:ok, map} | {:error, Changeset.t | String.t}
  def invite_as_single_room_guest(%User{} = inviter, %Team{id: team_id} = team, params) do
    with default_attrs = %{team_id: team_id, roles: ["single-room-guest"]},
         %Changeset{valid?: true} = invite <- SingleRoomGuestInvite.changeset(params),
         {:group, group} when not is_nil(group) <- {:group, GroupQueries.get_by_id(team, invite.changes.group_id)},
         attrs = Map.merge(default_attrs, %{email: invite.changes.email, groups_as_guest: [group.id]}),
         {:ok ,invitation} <- do_invite(inviter, attrs) do
      {:ok, Repo.preload(invitation, :user)}
    else
      %Changeset{valid?: false} = changeset -> {:error, changeset}
      {:group, nil} -> {:error, "Invalid group id."}
      error -> error
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
  def invite_as_multi_room_guest(%User{} = inviter, %Team{id: team_id}, params) do
    with default_attrs = %{team_id: team_id, roles: ["multi-room-guest"]},
         %Changeset{valid?: true} = invite <- MultiRoomGuestInvite.changeset(params),
         {:group, groups} when is_list(groups) <- {:group, validate_groups(team_id, invite.changes.group_ids)},
         attrs = Map.merge(default_attrs, %{email: invite.changes.email, groups_as_guest: invite.changes.group_ids}),
         {:ok ,invitation} <- do_invite(inviter, attrs) do
      {:ok, Repo.preload(invitation, :user)}
    else
      %Changeset{valid?: false} = changeset -> {:error, changeset}
      {:group, _} -> {:error, "Invalid group ids."}
      error -> error
    end
  end

  defp validate_groups(team_id, group_ids) do
    groups = GroupQueries.get_by_ids(group_ids, %User{team_id: team_id})
    valid_group_ids = for group <- groups, do: group.id
    invalid_group_ids = group_ids -- valid_group_ids
    if invalid_group_ids == [] do
      groups
    else
      :invalid_groups
    end
  end

  @doc """
  Invites user to the team via email address. If pending account
  for team with same email exists it returns error.
  """
  def invite_to_team(%User{} = user, email) do
    do_invite(user, %{email: email, team_id: user.team_id})
  end

  defp do_invite(invitor, %{email: email, team_id: team_id} = params) do
    new_user_changeset = User.team_invite_changeset(%User{}, params)
    case Repo.insert(new_user_changeset) do
      {:error, _changeset} ->
        invited_user = Repo.get_by(User, email: email, team_id: team_id)

        case invited_user do
          nil ->
            {:error, "Email isn't valid."}
          invited_user ->
            if invited_user.onboarded do
              {:error, "Email has already been registered."}
            else
              {:error, "Email has already been invited."}
            end
        end
      {:ok, new_user} ->
        invitation_changeset = Invitation.changeset(%Invitation{}, %{user_id: new_user.id, team_id: team_id})
        {:ok, invitation} = Repo.insert(invitation_changeset)
        analytics_track_new_invitation(invitor, email)
        Invitation.resend_invitation(invitor.id, invitation.id)
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
          user_to_delete = Repo.get(User, invitation.user_id)
          Repo.delete user_to_delete
          {:ok, invitation}
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
        params = params |> Map.put("team_id", invite.team_id) |> Map.put("roles", ["member"])
        case Stitch.Accounts.update_and_complete_user_onboarding(invite.user_id, params) do
          %User{} = user -> {:ok, user}
          error -> error
        end
      end)
      |> Repo.transaction

    case result do
      {:ok, %{user: user}} ->
        default_group = Stitch.GroupQueries.default_group(user)
        Stitch.Group.add_user(default_group, user)
        {:ok, %{user: user, groups: [default_group]}}
      {:error, _, error, _} ->
        {:error, error}
    end
  end
end
