defmodule Stitch.Files.Thumb do
  alias Stitch.{AWS.S3}
  import Mogrify

  @settings Application.get_env(:stitch, :user_upload_settings)

  @spec create(map) :: {:ok, map} | {:error, term}
  def create(%{"mimetype" => "image/tiff"}), do: {:error, "Unsupported type"}

  def create(%{"url" => url, "mimetype" => "image/" <> _image}) do
    IO.inspect("here is thumb 1")
    with {:ok, filename} <- get_filename(url),
         dest = Path.join(System.tmp_dir!(), filename),
         {:ok, :done} <- S3.download(filename, dest),
         image <- generate_preview(dest),
         %Mogrify.Image{path: preview_path} <- image,
         %Mogrify.Image{height: preview_height, width: preview_width} <- Mogrify.verbose(image),
         {:ok, %{status_code: 200}} <- S3.upload(preview_path),
         :ok <- File.rm(dest),
         :ok <- File.rm(preview_path) do
      preview = %{
        "preview_height" => preview_height,
        "preview_width" => preview_width,
        "preview_url" => S3.fullpath(preview_path)
      }

      {:ok, preview}
    else
      error ->
        {:error, error}
    end
  end

  def create(%{"url" => url, "mimetype" => "application/pdf"}) do
    with {:ok, filename} <- get_filename(url),
         dest = Path.join(System.tmp_dir!(), filename),
         {:ok, :done} <- S3.download(filename, dest),
         {:ok, preview_path} <- Stitch.Files.ThumbGenerator.generate_pdf_thumbnail(dest),
         image <- Mogrify.open(preview_path),
         %Mogrify.Image{height: preview_height, width: preview_width} <- Mogrify.verbose(image),
         {:ok, %{status_code: 200}} <- S3.upload(preview_path),
         :ok <- File.rm(dest),
         :ok <- File.rm(preview_path) do
      preview = %{
        "preview_height" => preview_height,
        "preview_width" => preview_width,
        "preview_url" => S3.fullpath(preview_path)
      }

      {:ok, preview} |> IO.inspect(label: "here is thumb create end")
    else
      error ->
        {:error, error}
    end
  end

  def create(_fields) do
    {:error, "Unsupported type"}
  end

  @spec generate_preview(binary) :: Mogrify.Image.t()
  def generate_preview(origin) do
    origin
    |> open
    |> resize_to_limit("#{@settings.max_preview_width}x#{@settings.max_preview_height}")
    |> save
  end

  defp get_filename(url) do
    IO.inspect("get_filename")
    IO.inspect(url, label: "here is url")
    # IO.inspect(URI.parse(url), label: "here is path")
    # String.replace
    with %{path: path} <- URI.parse(url) do
      {:ok, Path.basename(path)} |> IO.inspect(label: "here is path basename")
    end
  end
end
