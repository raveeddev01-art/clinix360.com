defmodule Stitch.Accounts.User do
  @moduledoc """
  The User schema module.
  """
  use Ecto.Schema
  import Ecto.Changeset
  alias Stitch.Accounts.User
  alias Stitch.{Repo, Accounts.ProfileImage, GroupUser}

  @type t :: %__MODULE__{}
  @guest_roles Stitch.Accounts.Role.guests()
  @notification_sounds [
    "bubbling-up",
    "case-closed",
    "definite",
    "hold-on",
    "isnt-it",
    "light",
    "open-ended",
    "plucky",
    "pop",
    "quite-impressed",
    "to-the-point",
    "unconvinced",
    "unsure"
  ]

  schema "users" do
    field(:email, :string)
    field(:roles, {:array, :string})
    field(:password_hash, :string)
    field(:first_name, :string)
    field(:last_name, :string)
    field(:phone_number, :string)
    field(:profile_image_url, :string)
    field(:profile_image_thumb_url, :string)
    field(:confirmation_code, :string)
    field(:title, :string)
    field(:email_confirmed, :boolean, default: false)
    field(:onboarded, :boolean, default: false)
    field(:username, :string)
    field(:pin, :string)
    field(:token, :string)
    field(:disabled, :boolean, default: false)
    field(:desktop_notification_preference, :string, default: "everything")
    field(:mobile_notification_preference, :string, default: "everything")
    field(:email_notification_preference, :string, default: "daily")
    field(:is_staff, :boolean, default: false)
    field(:is_bot, :boolean, default: false)
    field(:groups_as_guest, {:array, :integer}, default: [])
    field(:timezone, :map, default: %{})
    ###### add status with time ###########
    field(:status_text, :string)
    field(:status_emoji, :string)
    field(:status_time, :naive_datetime)
    #################

    ######### schedule msg ##############
    field(:schedule_msg, :string)
    field(:schedule_time, :naive_datetime)
    ####################################

    field(:whats_new_last_seen_at, :utc_datetime)
    field(:slack_import_id, :string)
    field(:desktop_sound, :string, default: "pop")
    # Pending, Later, Skipped, Completed
    field(:connect_tour_status, :string, default: "pending")
    field(:platform_tour_status, :string, default: "pending")
    belongs_to(:team, Stitch.Team)
    has_one(:invitation, Stitch.Invitation, on_delete: :delete_all)
    has_many(:password_reset_token, Stitch.Accounts.PasswordResetToken, on_delete: :delete_all)

    field(:password, :string, virtual: true)

    timestamps()
  end

  def changeset(%User{} = struct, attrs) do
    struct
    |> cast(attrs, [
      :first_name,
      :last_name,
      :email,
      :pin,
      :phone_number,
      :title,
      :username,
      :timezone,
      :connect_tour_status,
      :platform_tour_status
    ])
    |> validate_username(attrs)
    |> unique_constraint(:email, name: :users_email_team_id_index)
    |> Stitch.Validators.valid_email_changeset(attrs)
    |> validate_required([:first_name, :last_name])
    |> ProfileImage.default_profile_image_changeset(attrs)
    |> update_change(:email, &String.trim/1)
    |> validate_timezone()
    |> Stitch.Validators.validate_no_emojis(:first_name)
    |> Stitch.Validators.validate_no_emojis(:last_name)
  end

  def changeset_without_email(%User{} = struct, attrs) do
    struct
    |> cast(attrs, [:first_name, :last_name, :pin, :phone_number, :title, :username, :timezone])
    |> validate_username(attrs)
    |> unique_constraint(:email, name: :users_email_team_id_index)
    |> validate_required([:first_name, :last_name])
    |> ProfileImage.default_profile_image_changeset(attrs)
    |> validate_timezone()
    |> Stitch.Validators.validate_no_emojis(:first_name)
    |> Stitch.Validators.validate_no_emojis(:last_name)
  end

  def validate_username(%Ecto.Changeset{changes: %{username: _}} = changeset, params) do
    username_changeset(changeset, params)
  end

  def validate_username(changeset, _), do: changeset

  def preference_changeset(%User{} = struct, params) do
    struct
    |> cast(params, [
      :desktop_notification_preference,
      :mobile_notification_preference,
      :email_notification_preference,
      :desktop_sound
    ])
    |> validate_required([
      :desktop_notification_preference,
      :mobile_notification_preference,
      :email_notification_preference
    ])
    |> validate_inclusion(:desktop_notification_preference, ["everything", "mentions", "nothing"])
    |> validate_inclusion(:mobile_notification_preference, ["everything", "mentions", "nothing"])
    |> validate_inclusion(:email_notification_preference, ["daily", "hourly", "15min", "never"])
    |> validate_inclusion(:desktop_sound, @notification_sounds)
  end

  def update_preference(%User{} = user, params) do
    Repo.transaction(fn ->
      user_update =
        user
        |> preference_changeset(params)
        |> Repo.update()

      case user_update do
        {:ok, user} ->
          group_preferences = params["group_preferences"]

          if group_preferences,
            do: GroupUser.batch_preference_update(group_preferences, user)

          %{user: user}

        {:error, changeset} ->
          Repo.rollback(changeset)
      end
    end)
  end

  def schedule_msg_changeset(struct, attrs) do
    struct
    |> cast(attrs, [:schedule_msg, :schedule_time])
    |> validate_required([:schedule_msg, :schedule_time])
  end
  def status_changeset(struct, attrs) do
    struct
    |> cast(attrs, [:status_text, :status_emoji, :status_time])
    |> validate_required([:status_text, :status_emoji, :status_time])
  end
  @doc """
  Applies the attributes: email, confirmation_code and token
  to the Stitch.Accounts.User struct.

  ## Examples

      user = %Stitch.Accounts.User{}
      Stitch.Accounts.User.email_changeset(user, %{email: "a@email.com", confirmation_code: "123456", token: "abc"})

  """
  def email_changeset(struct, attrs) do
    struct
    |> cast(attrs, [:email, :confirmation_code, :token])
    |> validate_required([:email, :confirmation_code, :token])
    |> Stitch.Validators.valid_email_changeset(attrs)
    |> update_change(:email, &String.trim/1)
    |> update_change(:email, &String.downcase/1)
  end

  @doc """
  Applies the attributes: email, team_id to the Stitch.Accounts.User struct.
  """
  def team_invite_changeset(struct, params) do
    digits = for _ <- 1..6, do: :rand.uniform(9)

    confirmation_code =
      digits
      |> Enum.join()

    token = Stitch.Rand.token(32)

    struct
    |> cast(params, [:team_id, :roles, :groups_as_guest])
    |> validate_required([:team_id])
    |> put_change(:confirmation_code, confirmation_code)
    |> put_change(:token, token)
    |> email_changeset(params)
    |> unique_constraint(:email, name: :users_email_team_id_index)
  end

  # ====

  def role_change_changeset(struct, params) do
    struct
    |> change(params)
  end

  def onboarding_complete_changeset(struct, params) do
    struct
    |> cast(params, [:first_name, :phone_number, :last_name, :password, :pin, :team_id, :roles])
    |> username_changeset(params)
    |> validate_required([:first_name, :last_name])
    |> Stitch.Validators.validate_no_emojis(:first_name)
    |> Stitch.Validators.validate_no_emojis(:last_name)
    |> ensure_role()
    |> unique_constraint(:team_id, name: :users_email_team_id_index)
    |> validate_required([:pin, :team_id, :roles])
    |> ProfileImage.default_profile_image_changeset(params)
    |> put_change(:onboarded, true)
    |> put_change(:whats_new_last_seen_at, DateTime.utc_now())
  end

  def timezone_changeset(struct, params) do
    struct
    |> cast(params, [:timezone])
    |> validate_timezone()
  end

  def validate_timezone(%{valid?: true, changes: %{timezone: timezone}} = changeset) do
    case timezone do
      %{"tz" => tz, "tz_offset" => tz_offset} when is_binary(tz) and is_integer(tz_offset) ->
        if Timex.Timezone.exists?(tz) do
          changeset
        else
          add_error(changeset, :timezone, "Invalid timezone format #{tz}")
        end

      _ ->
        add_error(changeset, :timezone, "Invalid timezone format")
    end
  end

  def validate_timezone(changeset), do: changeset

  defp ensure_role(%Ecto.Changeset{} = changeset) do
    roles = get_field(changeset, :roles) || []

    if roles == [] do
      put_change(changeset, :roles, ["member"])
    else
      changeset
    end
  end

  def password_update_changeset(struct, params) do
    struct
    |> cast(params, [:password])
    |> validate_required([:password])
  end

  def username_changeset(data, params) do
    data
    |> cast(params, [:username, :team_id])
    |> validate_required(:username)
    |> validate_length(:username, min: 2, max: 50)
    |> validate_format(:username, ~r/^[a-z0-9_]+$/)
    |> unsafe_validate_unique([:username, :team_id], Repo)
    |> unique_constraint(:username, name: :users_username_team_id_index)
  end

  def profile_image_changeset(struct, params) do
    struct
    |> cast(params, [:profile_image_url])
    |> add_thumb()
  end

  def add_thumb(%{valid?: true, changes: %{profile_image_url: url}} = changeset) do
    case ProfileImage.create_thumb(url) do
      {:ok, profile_image_thumb_url} ->
        put_change(changeset, :profile_image_thumb_url, profile_image_thumb_url)

      {:error, _error} ->
        changeset
    end
  end

  def add_thumb(changeset) do
    changeset
  end

  @doc """
  Checks if the user is a guest based on their roles.
  """
  @spec guest?(User.t()) :: boolean
  def guest?(%User{roles: [role]}) when role in @guest_roles, do: true
  def guest?(%User{}), do: false

  @doc """
  Updates user's timezone. The timezone should have the following format:
    %{ "tz" : "America/Los_Angeles"
       "tz_label" : "Pacific Daylight Time"
       "tz_offset" : -25200 } # offset in seconds
  """
  @spec update_timezone(User.t(), map) :: {:ok, User.t()} | {:error, Ecto.Changeset.t()}
  def update_timezone(%User{} = user, timezone) do
    user
    |> timezone_changeset(%{"timezone" => timezone})
    |> Repo.update()
  end

  @doc """
  If the user has not uploaded an avatar, get a cached or new presigned URL for the user.
  """
  @spec grey_avatar(User.t()) :: binary | nil
  def grey_avatar(user) do
    if has_default_image(user) do
      filepath = String.split(user.profile_image_url, "/") |> List.last()

      # EX.png
      name = String.split(filepath, ".") |> List.first()

      # Turn to EX-grey.png
      grey_avatar_url = String.replace(user.profile_image_url, filepath, "#{name}-grey.png")

      # Fetch a presigned URL for this grey image.
      Stitch.PresignedUrlCache.fetch(grey_avatar_url)
    end
  end

  @spec has_default_image(User.t()) :: boolean
  @doc """
  Returns true if the user has the default image
  """
  def has_default_image(user) do
    if user.profile_image_url do
      # Default images look like this: https://s3.amazonaws.com/stitch-content/ST.png
      # We check if the image name length ST.png is equal to 6.
      String.split(user.profile_image_url, "/") |> List.last() |> String.length() == 6
    else
      false
    end
  end

  def notification_sounds, do: @notification_sounds

  @spec is_active?(User.t()) :: boolean
  def is_active?(%User{disabled: false, onboarded: true}), do: true
  def is_active?(_user), do: false
end
