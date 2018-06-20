defmodule Stitch.Repo.Scripts.AssigPublicStatusToUpload do
  @moduledoc """
  sh> mix run apps/stitch/priv/repo/scripts/assign_public_to_uploads.exs

  iex> Code.load_file("apps/stitch/priv/repo/scripts/assign_public_to_uploads.exs")
  iex> Stitch.Repo.Scripts.AssigPublicStatusToUpload.run()
  """

  use Ecto.Migration

  import Ecto.Query
  require Logger

  alias Stitch.{
    Files.Upload,
    Files.FileQueries,
    Repo,
    Group,
    Message,
    GroupQueries,
    UserQueries,
    Accounts.User
  }

  def run do
    Repo.transaction(
      fn ->
        Upload
        |> Repo.stream()
        |> Stream.each(fn upload ->
          try do
            with %Upload{} = upload <- FileQueries.get_by_id(upload.id, preload_assoc: true) do
              result =
                Group
                |> where([g], g.id in ^upload.shared_in)
                |> where(public: ^true)
                |> select([g], true)
                |> limit(1)
                |> Repo.one()

              shared_in_public_group? = !!result

              unless shared_in_public_group? do
                result =
                  upload
                  |> Ecto.Changeset.change(public: false)
                  |> Repo.update()

                case result do
                  {:ok, _} ->
                    nil

                  {:error, error} ->
                    Logger.error(
                      "Error assinging public status to upload #{upload.id} #{inspect(error)}"
                    )
                end
              end
            else
              error ->
                Logger.error(
                  "Error assinging public status to upload #{upload.id} #{inspect(error)}"
                )
            end
          rescue
            error ->
              Logger.error(
                "Error creating and sharing the file (#{upload.id}): #{inspect(error)}"
              )

              :error
          end
        end)
        |> Stream.run()
      end,
      timeout: :infinity
    )
  end
end

Stitch.Repo.Scripts.AssigPublicStatusToUpload.run()
