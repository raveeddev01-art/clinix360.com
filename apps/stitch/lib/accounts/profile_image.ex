defmodule Stitch.Accounts.ProfileImage do
  alias Stitch.AWS.S3
  import Mogrify
  import Ecto.Changeset
  alias Stitch.Rand

  @thumb %{height: 72, width: 72}

  @spec needs_avatar_regen(any) :: boolean
  def needs_avatar_regen(changeset) do
    first_name_changed =
      case Ecto.Changeset.fetch_change(changeset, :first_name) do
        {:ok, _first_name} ->
          true

        _ ->
          false
      end

    last_name_changed =
      case Ecto.Changeset.fetch_change(changeset, :last_name) do
        {:ok, _last_name} ->
          true

        _ ->
          false
      end

    emptied_profile_image? =
      case Ecto.Changeset.fetch_change(changeset, :profile_image_url) do
        {:ok, profile_image_url} ->
          profile_image_url == nil

        _ ->
          false
      end

    # TODO: Database field boolean to track if user uploads a custom avatar?
    # Right now we're just checking if the length matches the two letter filename
    # we use for generate initials based avatar.
    profile_image_url_length =
      if changeset.data.profile_image_url do
        String.length(changeset.data.profile_image_url)
      else
        46
      end

    # Regen if user has the default image and changed his name; or if he's deleted his existing profile image.
    emptied_profile_image? ||
      (profile_image_url_length == 46 && (first_name_changed || last_name_changed))
  end

  @spec create_thumb(binary) :: {:ok, binary} | {:error, term}
  def create_thumb(url) do
    with {:ok, fullname} <- S3.basepath(url),
         {:ok, filename} <- get_filename(url),
         extname = Path.extname(fullname),
         dest = Path.join(System.tmp_dir!(), filename),
         {:ok, :done} <- S3.download(fullname, dest),
         %Mogrify.Image{path: preview_path} <- generate_preview(dest),
         avatar_name = String.downcase(Rand.token(32)) <> extname,
         {:ok, %{status_code: 200}} <- S3.upload_avatar(preview_path, avatar_name),
         :ok <- File.rm(dest),
         :ok <- File.rm(preview_path) do
      {:ok, S3.avatar_path(avatar_name)}
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

  @default_profile_images [
    %{
      image_url: S3.fullpath("default-avatar.png"),
      thumb_url: S3.fullpath("default-avatar-thumb.png")
    }
  ]

  @doc """
  Given a user returns an S3 url pointing to a default avatar
  url that can be set for the user.
  """
  # @spec pick_default_random(User.t()) :: {:ok, binary}
  def pick_default_random(%{first_name: first_name, last_name: last_name} = _user) do
    with {:ok, image_path} <- create_from_initials(first_name, last_name),
         {:ok, %{status_code: 200}} <- S3.upload(image_path),
         {:ok, grey_image_path} <- create_from_initials_grey(first_name, last_name),
         {:ok, %{status_code: 200}} <- S3.upload(grey_image_path),
         :ok <- File.rm(image_path),
         :ok <- File.rm(grey_image_path) do
      {:ok, S3.fullpath(image_path)}
    else
      error ->
        {:error, error}
    end
  end

  def pick_default_random(), do: Enum.random(@default_profile_images)

  @doc """
  Generates an image using first name and last name of a user using
  imagemagick's convert command line tool.
  """
  @spec create_from_initials(binary, binary) :: {:ok, binary}
  def create_from_initials(first_name, last_name)
      when byte_size(first_name) > 0 and byte_size(last_name) > 0 do
    size = 512
    resolution = 72
    sampling_factor = 3
    background_color = "#003366"
    text_color = "#FFFFFF"
    first_initial = String.at(first_name, 0) |> String.upcase()
    last_initial = String.at(last_name, 0) |> String.upcase()
    initials = "#{first_initial}#{last_initial}"
    image_path = System.tmp_dir!() |> Path.join("#{initials}.png")

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
      Application.app_dir(:stitch, "priv/fonts/SourceSansPro-Bold.otf"),
      # font size
      "-pointsize",
      "250",
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

  @doc """
  Generates an image using first name and last name of a user using
  imagemagick's convert command line tool.
  """
  @spec create_from_initials_grey(binary, binary) :: {:ok, binary}
  def create_from_initials_grey(first_name, last_name)
      when byte_size(first_name) > 0 and byte_size(last_name) > 0 do
    size = 512
    resolution = 72
    sampling_factor = 3
    background_color = "#f0f0f0"
    text_color = "#003366"
    first_initial = String.at(first_name, 0) |> String.upcase()
    last_initial = String.at(last_name, 0) |> String.upcase()
    initials = "#{first_initial}#{last_initial}"
    image_path = System.tmp_dir!() |> Path.join("#{initials}-grey.png")

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
      Application.app_dir(:stitch, "priv/fonts/SourceSansPro-Bold.otf"),
      # font size
      "-pointsize",
      "250",
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

  # =================
  # CHANGESET HELPERS
  # =================

  @doc """
  Given a changeset struct and params. Cast profile urls and regen if needed.
  Used on Users and Patients.
  """
  def default_profile_image_changeset(struct, params) do
    changeset =
      struct
      |> cast(params, [:profile_image_url, :profile_image_thumb_url])

    cond do
      needs_avatar_regen(changeset) ->
        IO.inspect("Regen Required")
        add_default_profile_image(changeset)

      true ->
        changeset
    end
  end

  defp add_default_profile_image(%{valid?: true} = changeset) do
    user_or_patient = %{
      first_name: get_first_name(changeset),
      last_name: get_last_name(changeset)
    }

    with {:ok, avatar} <- pick_default_random(user_or_patient) |> IO.inspect(label: "pick default result"),
         {:ok, avatar_thumb} <- create_thumb(avatar) |> IO.inspect(label: "thumb created") do
      IO.inspect("With clause executed")
      changeset
      |> put_change(:profile_image_url, avatar)
      |> put_change(:profile_image_thumb_url, avatar_thumb)
    else
      _ ->
        changeset
    end
  end

  defp add_default_profile_image(changeset), do: changeset

  defp get_first_name(changeset) do
    case Ecto.Changeset.fetch_change(changeset, :first_name) do
      {:ok, first_name} ->
        first_name

      _ ->
        changeset.data.first_name
    end
  end

  defp get_last_name(changeset) do
    case Ecto.Changeset.fetch_change(changeset, :last_name) do
      {:ok, last_name} ->
        last_name

      _ ->
        changeset.data.last_name
    end
  end
end
