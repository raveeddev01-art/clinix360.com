defmodule Stitch.Invitation do
  @moduledoc """
  Module in charge of handling team invitation actions.
  """
  use Ecto.Schema
  import Ecto.{Changeset, Query}
  alias Stitch.{Repo, Accounts.User, Team, Invitation}

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
  Invites user to the team via email address. If pending account
  for team with same email exists it returns error.
  """
  def invite_to_team(user_id, email) do
    user = Repo.get(User, user_id)
    team = Repo.get(Team, user.team_id)
    if team.open_invitations_enabled || Enum.member?(user.roles, "admin") do
      new_user_changeset = User.team_invite_changeset(
        %User{}, %{
          email: email,
          team_id: team.id
        }
      )
      case Repo.insert(new_user_changeset) do
        {:error, _changeset} ->
          {:error, "User already exists with this email address."}
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
  def list_pending_team_invitations(user_id) do
    user = Repo.get(User, user_id)
    team = Repo.get(Team, user.team_id)
    query =
      from i in Invitation,
      where: i.team_id == ^user.team_id,
      where: i.accepted == ^false,
      preload: [:user]

    if team.open_invitations_enabled || Enum.member?(user.roles, "admin") do
      Repo.all(query)
    else
      {:error, "User unauthorized to see list of invitations."}
    end
  end

  @doc """
  Resends invitation email to the user provided the invite hasn't
  been accepted yet.
  """
  def resend_invitation(user_id, invitation_id) do
    user = Repo.get(User, user_id)
    team = Repo.get(Team, user.team_id)
    if team.open_invitations_enabled || Enum.member?(user.roles, "admin") do
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
    if team.open_invitations_enabled || Enum.member?(user.roles, "admin") do
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
        groups = add_user_to_groups(user, [default_group])
        {:ok, %{user: user, groups: groups}}

      {:error, _, error, _} ->
        {:error, error}
    end
  end

  defp add_user_to_groups(user, groups) do
    groups |> Enum.reduce([], fn (group, acc) ->
      case Stitch.Group.add_user(group, user.id) do
        {:ok, %{system_message: system_message}} -> [{group, system_message} | acc]
        _ -> acc
      end
    end)
  end
end
