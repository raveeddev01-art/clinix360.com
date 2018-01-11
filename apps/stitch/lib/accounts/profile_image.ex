defmodule Stitch.Accounts.ProfileImage do
  alias ExAws.S3
  import Mogrify

  @s3 Application.get_env(:stitch, :aws_user_upload)

  @thumb %{height: 48, width: 48}

  @spec create_thumb(binary) :: {:ok, binary} | {:error, term}
  def create_thumb(url) do
    with {:ok, fullname} <- get_fullname(url),
        dirname = Path.dirname(fullname),
        {:ok, filename} <- get_filename(url),
        dest = Path.join(System.tmp_dir!, filename),
        {:ok, :done} <- download(fullname, dest),
        %Mogrify.Image{path: preview_path} <- generate_preview(dest),
        {:ok, %{status_code: 200}} <- upload(preview_path),
        :ok <- File.rm(dest),
        :ok <- File.rm(preview_path) do
      {:ok, "https://#{@s3.host}/#{@s3.bucket}/#{Path.join(dirname, Path.basename(preview_path))}"}
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
    S3.download_file(@s3.bucket, "/#{filename}", dest) |> ExAws.request
  end

  @spec generate_preview(binary) :: Mogrify.Image.t
  def generate_preview(origin) do
    origin
    |> open
    |> resize_to_limit("#{@thumb.width}x#{@thumb.height}")
    |> save
  end

  defp get_fullname(url) do
    with %{path: path} <- URI.parse(url) do
      {:ok, Path.relative_to(path, "/#{@s3.bucket}")}
    end
  end

  defp get_filename(url) do
    with %{path: path} <- URI.parse(url) do
      {:ok, Path.basename(path)}
    end
  end

  @host Application.get_env(:stitch_connect, :application_host)
  @default_profile_images [
    %{
      image: "https://#{@s3.host}/#{@s3.bucket}/default-avatar.png",
      thumb: "https://#{@s3.host}/#{@s3.bucket}/default-avatar-thumb.png"
    }
  ]

  def pick_default_random(), do: Enum.random(@default_profile_images)
end
