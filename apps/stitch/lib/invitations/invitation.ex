defmodule Stitch.Invitation do
  @moduledoc """
  Module in charge of handling team invitation actions.
  """
  use Ecto.Schema
  import Ecto.{Changeset, Query}
  alias Stitch.{Repo, User, Team}

  schema "invitations" do
    belongs_to :user, Stitch.Accounts.User
    belongs_to :team, Stitch.Team
    field :invite_token, :string
    field :accepted, :boolean, default: false

    timestamps()
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
          Stitch.Accounts.Email.team_invitation("#{user.first_name} #{user.last_name}", invitation)
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
  def revoke(user_id, invitation_id) do
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
