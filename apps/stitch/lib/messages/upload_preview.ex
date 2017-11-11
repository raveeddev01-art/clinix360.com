defmodule Stitch.UploadPreview do
  alias ExAws.S3
  alias Stitch.{Repo, Message}
  import Mogrify

  @settings Application.get_env(:stitch, :user_upload_settings)
  @s3 Application.get_env(:stitch, :aws_user_upload)

  @spec add_preview(Message.t) :: {:ok, Message.t} | {:error, Message.t}
  def add_preview(%Message{type: "upload", fields: %{"url" => url, "mimetype" => "image/" <> _image}} = upload) when not is_nil(url) do
    case create_preview(upload) do
      {:ok, preview} ->
        fields = Map.merge(upload.fields, preview)
        upload
        |> Message.upload_changeset(%{fields: fields})
        |> Repo.update
      {:error, _error} ->
        {:error, upload}
    end
  end
  def add_preview(_upload), do: {:error, "Unsupported type"}

  @spec create_preview(map) :: {:ok, map} | {:error, term}
  def create_preview(%{"url" => url, "mimetype" => "image/" <> _image}) do
    with {:ok, filename} <- get_filename(url),
        dest = Path.join(System.tmp_dir!, filename),
        {:ok, :done} <- download(filename, dest),
        %Mogrify.Image{path: preview_path} = image <- generate_preview(dest),
        %Mogrify.Image{height: preview_height, width: preview_width} <- Mogrify.verbose(image),
        {:ok, %{status_code: 200}} <- upload(preview_path),
        :ok <- File.rm(dest),
        :ok <- File.rm(preview_path) do
      preview = %{
        preview_height: preview_height,
        preview_width: preview_width,
        preview_url: "https://#{@s3.host}/#{@s3.bucket}/#{Path.basename(preview_path)}"
      }
      {:ok, preview}
    else error ->
      {:error, error}
    end
  end
  def create_preview(_fields), do: {:error, "Unsupported type"}

  @spec upload(binary) :: {:ok, map} | {:error, term}
  def upload(path) do
    object_name = Path.basename(path)
    path
    |> S3.Upload.stream_file()
    |> S3.upload(@s3.bucket, object_name, encryption: "AES256")
    |> ExAws.request()
  end

  @spec download(binary, binary) :: {:ok, :done} | {:error, term}
  def download(filename, dest) do
    S3.download_file(@s3.bucket, filename, dest) |> ExAws.request
  end

  @spec generate_preview(binary) :: Mogrify.Image.t
  def generate_preview(origin) do
    origin
    |> open
    |> resize_to_limit("#{@settings.max_preview_width}x#{@settings.max_preview_height}")
    |> save
  end

  defp get_filename(url) do
    with %{path: path} <- URI.parse(url) do
      {:ok, Path.basename(path)}
    end
  end
end
