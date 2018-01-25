defmodule Stitch.UserAuthorization do
  @moduledoc """
  Onboarding module used to onboard new teams to the Stitch
  platform.
  """

  alias Stitch.{Accounts.User}

  def can_update_user?(%User{id: user_id}, user_id), do: true
  def can_update_user?(%User{roles: roles}, _), do: "admin" in roles
end
