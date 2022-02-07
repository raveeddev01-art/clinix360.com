defmodule Stitch.Repo.Scripts.GeneratePdfThumbs do
  @moduledoc """
  # mix run apps/stitch/priv/repo/generate_pdf_thumbs.ex
  """

  require Logger

  import Ecto.Query
  import Ecto.Changeset

  alias Stitch.Files.Upload
  alias Stitch.Message
  alias Stitch.Repo
  alias Stitch.ChunkStream

  def run do
    Upload
    |> where(mimetype: ^"application/pdf")
    |> where([u], is_nil(u.preview_url))
    |> ChunkStream.chunk(1)
    |> Stream.each(fn
      [%{preview_url: nil, mimetype: "application/pdf"} = upload] ->
        try do
          result = upload |> Upload.fields() |> Upload.create_preview([])

          case result do
            {:ok,
             %{
               "preview_height" => preview_height,
               "preview_url" => preview_url,
               "preview_width" => preview_width
             } = preview_metadata} ->
              {:ok, _result} =
                upload
                |> change(preview_height: preview_height)
                |> change(preview_url: preview_url)
                |> change(preview_width: preview_width)
                |> Repo.update()
                |> log_error()

              Message
              |> where(upload_id: ^upload.id)
              |> Repo.all()
              |> Enum.each(fn message ->
                message
                |> change(fields: Map.merge(message.fields, preview_metadata))
                |> Repo.update()
                |> log_error()
              end)

            _ ->
              nil
          end
        rescue
          error -> error
        end

      _ ->
        nil
    end)
    |> Stream.run()
  end

  def log_error({:error, changeset} = result) do
    Logger.error("Error updating record #{inspect(changeset)}")
    result
  end

  def log_error(result) do
    result
  end
end

Stitch.Repo.Scripts.GeneratePdfThumbs.run()
