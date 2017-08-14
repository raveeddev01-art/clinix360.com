defmodule Stitch.Accounts.Admin do
  @moduledoc """
  The Accounts Admin context. Operations for administering a
  users account.
  """

  alias Stitch.Repo
  alias Stitch.User

  @doc """
  Sets the disabled boolean flag to true for the provided user.
  """
  def deactivate(user_id) do
    Repo.get(User, user_id)
    |> Ecto.Changeset.change(disabled: true)
    |> Repo.update
  end

  @doc """
  Updates the user information
  """

  def update_user(user_id, params)
  when is_integer(user_id) and is_map(params) do
     user = Repo.get(User, user_id)
     user
     |> User.changeset(params)
     |> Repo.update
  end
  def update_user(_, _), do: {:error, "Invalid User ID or Parameters"}

  @spec update_unread_message_notification_interval(number, number) :: {:ok, term} | {:error, term}
  @doc """
  Updates the user unread_message_notification_interval field.
  """
  def update_unread_message_notification_interval(user_id, notification_interval) do
    # TODO
  end
end
