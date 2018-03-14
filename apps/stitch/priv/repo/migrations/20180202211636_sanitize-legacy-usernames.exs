defmodule Stitch.Repo.Migrations.SanitizeLegacyUsernames do
  use Ecto.Migration

  @disable_ddl_transaction true

  alias Stitch.{Repo}
  alias Stitch.Accounts.User

  def up do
    Repo.transaction(
      fn ->
        User
        |> Repo.stream()
        |> Stream.each(fn
          %{username: old_username} = user when not is_nil(old_username) ->
            new_username = Stitch.Util.Sanitizer.keep_lower_alphanumeric(old_username)

            if new_username != old_username do
              result =
                user
                |> User.username_changeset(%{username: new_username})
                |> Repo.update()

              case result do
                {:ok, updated_user} ->
                  IO.puts("User #{old_username} updated. New: #{updated_user.username}")

                {:error, changeset} ->
                  IO.puts("Error changing #{old_username} to #{new_username}:")
                  IO.inspect(changeset)
              end
            end

          _user ->
            nil
        end)
        |> Stream.run()
      end,
      timeout: :infinity
    )
  end

  def down do
  end
end
