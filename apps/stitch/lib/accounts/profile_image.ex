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

  @doc """
  Generates an image using first name and last name of a user using
  imagemagick's convert command line tool.
  """
  @spec create_from_initials(binary, binary) :: binary
  def create_from_initials(first_name, last_name)
      when byte_size(first_name) > 0 and byte_size(last_name) > 0 do
    size = 512
    resolution = 72
    sampling_factor = 3
    background_color = "#003366"
    text_color = "#FFFFFF"
    initials = "#{String.at(first_name, 0)}#{String.at(last_name, 0)}"
    image_path = System.tmp_dir!() |> Path.join("#{initials}.png") |> IO.inspect()

    System.cmd("convert", [
      # sample up
      "-density",
      "#{resolution * sampling_factor}",
      # corrected size
      "-size",
      "#{size * sampling_factor}x#{size * sampling_factor}",
      # background color
      "canvas:#{background_color}",
      # text color
      "-fill",
      text_color,
      # font location
      "-font",
      Application.app_dir(:stitch, "priv/fonts/SourceSansPro-Regular.otf"),
      # font size
      "-pointsize",
      "300",
      # center text
      "-gravity",
      "center",
      # render text, move down a bit
      "-annotate",
      "+0+0",
      "#{initials}",
      # sample down to reduce aliasing
      "-resample",
      "#{resolution}",
      image_path
    ])

    {:ok, image_path}
  end

  def create_from_initials(_first_name, _last_name) do
    {:error, "First name and last name must be sent"}
  end
end