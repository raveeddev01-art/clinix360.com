defmodule Stitch.Accounts.ProfileImage do
  alias Stitch.AWS.S3
  import Mogrify

  @thumb %{height: 48, width: 48}

  @spec create_thumb(binary) :: {:ok, binary} | {:error, term}
  def create_thumb(url) do
    with {:ok, fullname} <- S3.basepath(url),
         dirname = Path.dirname(fullname),
         {:ok, filename} <- get_filename(url),
         dest = Path.join(System.tmp_dir!(), filename),
         {:ok, :done} <- S3.download(fullname, dest),
         %Mogrify.Image{path: preview_path} <- generate_preview(dest),
         {:ok, %{status_code: 200}} <- S3.upload(preview_path),
         :ok <- File.rm(dest),
         :ok <- File.rm(preview_path) do
      {:ok, S3.fullpath(preview_path, dirname)}
    else
      error ->
        {:error, error}
    end
  end

  def create_preview(_fields), do: {:error, "Unsupported type"}

  @spec generate_preview(binary) :: Mogrify.Image.t()
  def generate_preview(origin) do
    origin
    |> open
    |> resize_to_limit("#{@thumb.width}x#{@thumb.height}")
    |> save
  end

  defp get_filename(url) do
    with %{path: path} <- URI.parse(url) do
      {:ok, Path.basename(path)}
    end
  end

  @default_profile_images [
    %{
      image_url: S3.fullpath("default-avatar.png"),
      thumb_url: S3.fullpath("default-avatar-thumb.png")
    }
  ]

  def pick_default_random(), do: Enum.random(@default_profile_images)
end
