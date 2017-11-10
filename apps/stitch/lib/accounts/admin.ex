defmodule Stitch.Accounts.Admin do
  @moduledoc """
  The Accounts Admin context. Operations for administering a
  users account.
  """

  alias Stitch.Repo
  alias Stitch.Accounts.User
  alias Stitch.Team

  @doc """
  Sets the disabled boolean flag to false for the provided user.
  """
  def activate(%Team{id: team_id}, user_id) do
    if user = Repo.get_by(User, team_id: team_id, id: user_id) do
      user
      |> Ecto.Changeset.change(disabled: false)
      |> Repo.update
    else
      {:error, :not_found}
    end
  end

  @doc """
  Sets the disabled boolean flag to true for the provided user.
  """
  def deactivate(%Team{id: team_id}, user_id) do
    if user = Repo.get_by(User, team_id: team_id, id: user_id) do
      analytics_track_user_disabled(user)
      user
      |> Ecto.Changeset.change(disabled: true)
      |> Repo.update
    else
      {:error, :not_found}
    end
  end

  defp analytics_track_user_disabled(user) do
    Stitch.Task.start(fn ->
      team_id = user.team_id
      team = Stitch.TeamQueries.get_by_id(team_id)
      active_users = Stitch.TeamQueries.list_active_users(team)
      properties = %{
        "first_name"   => user.first_name,
        "last_name"    => user.last_name,
        "email"        => user.email,
        "team_id"      => Integer.to_string(team.id),
        "team_name"    => team.name,
        "team_slug"    => team.slug,
        "active_users" => length(active_users)
      }
      Stitch.Analytics.track(user.id, "Account Disabled", properties)
    end)
  end

  @doc """
  Updates the user information
  """

  def update_user(user_id, params)
  when is_integer(user_id) and is_map(params) do
     Repo.get(User, user_id)
     |> User.changeset(params)
     |> Repo.update
  end
  def update_user(_, _), do: {:error, "Invalid User ID or Parameters"}

  def promote_admin(promoter, target_id) do
    user = Repo.get_by!(User, id: target_id, team_id: promoter.team_id)

    if user.id != promoter.id do
      changeset = Ecto.Changeset.change(user, roles: ["admin"])
      case Repo.update(changeset) do
        {:error, _changeset} -> {:error, "Failed to promote user."}
        success -> success
      end
    else
      {:error, "You cannot promote own account."}
    end
  end

  def revoke_admin(revoker, target_id) do
    user = Repo.get_by!(User, id: target_id, team_id: revoker.team_id)

    if user.id != revoker.id do
      changeset = Ecto.Changeset.change(user, roles: ["member"])
      case Repo.update(changeset) do
        {:error, _changeset} -> {:error, "Failed to revoke admin role from user."}
        success -> success
      end
    else
      {:error, "You cannot revoke admin role from your own account."}
    end
  end

  @spec update_unread_message_notification_interval(number, number) :: {:ok, term} | {:error, term}
  @doc """
  Updates the user unread_message_notification_interval field.
  """
  def update_unread_message_notification_interval(_user_id, _notification_interval) do
    # TODO
  end
end
