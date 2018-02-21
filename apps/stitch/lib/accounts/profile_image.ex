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
      when is_binary(first_name) and is_binary(last_name) do
    size = 512
    resolution = 72
    sampling_factor = 3
    background_color = "#E0E0E0"
    text_color = "#6D6D6D"
    save_path = "/dev/null"

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
      "/Library/Fonts/Roboto-Bold.ttf",
      # font size
      "-pointsize",
      "300",
      # center text
      "-gravity",
      "center",
      # render text, move down a bit
      "-annotate",
      "+0+#{25 * sampling_factor}",
      "#{first_name}#{last_name}",
      # sample down to reduce aliasing
      "-resample",
      "#{resolution}",
      save_path
    ])

    "saved"
  end

  def create_from_initials(_first_name, _last_name) do
    {:error, "First name and last name must be sent"}
  end
end