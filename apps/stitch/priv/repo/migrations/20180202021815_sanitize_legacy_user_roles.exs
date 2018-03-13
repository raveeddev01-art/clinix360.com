defmodule Stitch.Repo.Migrations.SanitizeLegacyUserRoles do
  use Ecto.Migration

  @disable_ddl_transaction true

  import Ecto.Query
  alias Stitch.Repo
  alias Stitch.Accounts.User

  def up do
    Repo.transaction(
      fn ->
        User
        |> select([:id, :email, :onboarded, :roles])
        |> Repo.stream()
        |> Stream.each(fn user ->
          cond do
            user.onboarded && user.roles != nil && length(user.roles) > 1 ->
              roles =
                user.roles
                |> enforce_guest
                |> enforce_admin

              user
              |> Ecto.Changeset.change(roles: roles)
              |> Repo.update()

            true ->
              IO.puts("User #{user.email} has no roles. Onboarded: #{user.onboarded}")
          end
        end)
        |> Stream.run()
      end,
      timeout: :infinity
    )
  end

  def down do
  end

  def enforce_guest(roles) do
    if "multi-room-guest" in roles || "single-room-guest" in roles do
      roles -- ["member", "admin"]
    else
      roles
    end
  end

  def enforce_admin(roles) do
    if "admin" in roles do
      roles -- ["member", "multi-room-guest", "single-room-guest"]
    else
      roles
    end
  end
end
