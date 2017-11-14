defmodule Stitch.MessageAuthorization do
  alias Stitch.{Accounts.User, Message}

  def can_delete?(%Message{user_id: user_id}, %User{id: user_id}), do: true
  def can_delete?(%Message{}, %User{roles: roles}), do: "admin" in roles
end
