defmodule Stitch.Repo.Migrations.ReplaceMessagesWithFiles do
  @moduledoc """
  For each upload:
    - Create Files from the uploads
    - "Share" it with the groups where they it posted
    - Update the upload Messages with `file_share` type and link it to the file
  """

  @disable_ddl_transaction true

  use Ecto.Migration
  import Ecto.Query
  require Logger

  alias Stitch.{
    Files.File,
    Repo,
    Group,
    Message,
    GroupQueries,
    UserQueries,
    Accounts.User
  }

  def up do
    Repo.transaction(fn ->
      Message
      |> where(type: ^"upload")
      |> Repo.stream()
      |> Stream.each(fn message ->
        with {:user, %User{} = user} <- {:user, UserQueries.get_by_id(message.user_id)},
             {:group, %Group{} = group} <- {:group, GroupQueries.get_by_id(message.group_id)},
             # Avoid re-generating previews
             {:file, {:ok, file, group_file}} <-
               {:file,
                File.create_and_share_with_group(group, user, message.fields, with_preview: false)} do
          result =
            message
            |> Ecto.Changeset.change(type: "file_share", file_id: file.id)
            |> Repo.update()

          case result do
            {:ok, message} ->
              message

            {:error, error} ->
              Logger.error("Error updating the message: #{inspect(error)}")
          end
        else
          error ->
            Logger.error("Error creating and sharing the file: #{inspect(error)}")
        end
      end)
      |> Stream.run()
    end)
  end

  def down do
  end
end
