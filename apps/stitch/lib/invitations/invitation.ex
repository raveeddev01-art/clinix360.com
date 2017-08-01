defmodule Stitch.Invitation do
  @moduledoc """
  Module in charge of handling team invitation actions.
  """
  use Ecto.Schema
  import Ecto.{Changeset, Query}
  alias Stitch.{Repo, User, Team, Invitation}

  schema "invitations" do
    belongs_to :user, Stitch.Accounts.User
    belongs_to :team, Stitch.Team
    field :invite_token, :string
    field :accepted, :boolean, default: false

    timestamps()
  end

  def changeset(struct, params) do
    invite_token = :crypto.strong_rand_bytes(32) |> Base.url_encode64 |> binary_part(0, 32)

    struct
    |> cast(params, [:user_id, :team_id])
    |> validate_required([:user_id, :team_id])
    |> put_change(:invite_token, invite_token)
  end

  @doc """
  Invites user to the team via email address. If pending account
  for team with same email exists it returns error.
  """
  def invite_to_team(user_id, email) do
    user = Repo.get(User, user_id)
    team = Repo.get(Team, user.team_id)
    if team.open_invitations_enabled || Enum.member?(user.roles, "admin") do
      new_user_changeset = Stitch.Accounts.User.team_invite_changeset(
        %Stitch.Accounts.User{}, %{
          email: email,
          team_id: team.id
        }
      )
      case Repo.insert(new_user_changeset) do
        {:error, changeset} ->
          {:error, "User already exists with this email address."}
        {:ok, new_user} ->
          invitation_changeset = Stitch.Invitation.changeset(%Stitch.Invitation{}, %{user_id: new_user.id, team_id: team.id})
          {:ok, invitation} = Repo.insert(invitation_changeset)
          Stitch.Invitation.resend_invitation(user_id, invitation.id)
      end
    else
      {:error, "User unauthorized to create a new invitation."}
    end
  end

  @doc """
  Returns a Stitch.Invitation struct given a valid invite_token
  parameter.
  """
  def get_by_invite_token(invite_token) when byte_size(invite_token) > 0 do
    case Repo.get_by(Invitation, invite_token: invite_token) do
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
  Returns a list of Invitations associated with the team.
  """
  def list_team_invitations(user_id) do
    user = Repo.get(User, user_id)
    team = Repo.get(Team, user.team_id)
    query =
      from i in Stitch.Invitation,
      where: i.team_id == ^user.team_id,
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
        from i in Stitch.Invitation,
        where: i.id == ^invitation_id,
        preload: [:user, :team]

      invitation = Repo.one(query)
      case invitation.accepted do
        true ->
          {:error, "This invitation has been accepted already."}
        false ->
          Stitch.Invitation.Email.team_invitation("#{user.first_name} #{user.last_name}", invitation)
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
        from i in Stitch.Invitation,
        where: i.id == ^invitation_id,
        preload: [:user, :team]

      invitation = Repo.one(query)
      case invitation.accepted do
        true ->
          {:error, "This invitation has been accepted already."}
        false ->
          Repo.delete invitation
      end
    else
      {:error, "User unauthorized to revoke invitation."}
    end
  end
end
