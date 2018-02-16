defmodule Stitch.Accounts.User do
  @moduledoc """
  The User schema module.
  """
  use Ecto.Schema
  import Ecto.Query
  import Ecto.Changeset
  alias Stitch.Accounts.User
  alias Stitch.GroupUser
  alias Stitch.Repo

  @type t :: %__MODULE__{}
  @guest_roles Stitch.Accounts.Role.guests()

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
    # List of groups the user is allowed in if user is a guest
    field(:groups_as_guest, {:array, :integer}, default: [])
    belongs_to(:team, Stitch.Team)
    has_one(:invitation, Stitch.Invitation, on_delete: :delete_all)
    has_many(:password_reset_token, Stitch.Accounts.PasswordResetToken, on_delete: :delete_all)

    field(:password, :string, virtual: true)

    timestamps()
  end

  def changeset(%User{} = struct, attrs) do
    struct
    |> cast(attrs, [:first_name, :last_name, :email, :pin, :phone_number, :title, :username])
    |> validate_username(attrs)
    |> unique_constraint(:email, name: :users_email_team_id_index)
    |> valid_email_changeset(attrs)
    |> validate_required([:first_name, :last_name])
    |> default_profile_image_changeset(attrs)
    |> update_change(:email, &String.trim/1)
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
      :email_notification_preference
    ])
    |> validate_required([
      :desktop_notification_preference,
      :mobile_notification_preference,
      :email_notification_preference
    ])
    |> validate_inclusion(:desktop_notification_preference, ["everything", "mentions", "nothing"])
    |> validate_inclusion(:mobile_notification_preference, ["everything", "mentions", "nothing"])
    |> validate_inclusion(:email_notification_preference, ["daily", "hourly", "15min", "never"])
  end

  def with_email_notification_preference(preference)
      when preference in ["daily", "hourly", "15min", "never"] do
    User
    |> where(email_notification_preference: ^preference)
    |> where(disabled: false)
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
          if group_preferences, do: GroupUser.batch_preference_update(group_preferences, user)
          %{user: user}

        {:error, changeset} ->
          Repo.rollback(changeset)
      end
    end)
  end

  def valid_email_changeset(struct, attrs) do
    struct
    |> cast(attrs, [:email])
    |> validate_format(:email, ~r/[\w-]+@([\w-]+\.)+[\w-]+/)
    |> Stitch.Validators.validate_email_domain(:email)
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
    |> valid_email_changeset(attrs)
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
    |> Stitch.Validators.validate_no_emojis(:first_name)
    |> Stitch.Validators.validate_no_emojis(:last_name)
    |> ensure_role()
    |> unique_constraint(:team_id, name: :users_email_team_id_index)
    |> validate_required([:phone_number, :pin, :team_id, :roles])
    |> default_profile_image_changeset(params)
    |> put_change(:onboarded, true)
  end

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
    |> validate_format(:username, ~r/^[a-z0-9]+$/)
    |> unsafe_validate_unique([:username, :team_id], Repo)
    |> unique_constraint(:username, name: :users_username_team_id_index)
  end

  def profile_image_changeset(struct, params) do
    struct
    |> cast(params, [:profile_image_url])
    |> add_thumb()
  end

  def default_profile_image_changeset(struct, params) do
    changeset =
      struct
      |> cast(params, [:profile_image_url, :profile_image_thumb_url])

    cond do
      Stitch.Accounts.ProfileImage.needs_avatar_regen(changeset) ->
        add_default_profile_image(changeset)
      true ->
        changeset
    end
  end

  def add_default_profile_image(%{valid?: true} = changeset) do
    user = %User{first_name: get_first_name(changeset), last_name: get_last_name(changeset)}
    with {:ok, avatar} <- Stitch.Accounts.ProfileImage.pick_default_random(user),
         {:ok, avatar_thumb} <- Stitch.Accounts.ProfileImage.create_thumb(avatar) do
      changeset
      |> put_change(:profile_image_url, avatar)
      |> put_change(:profile_image_thumb_url, avatar_thumb)
    else
      _ ->
        changeset
    end
  end

  def add_default_profile_image(changeset), do: changeset

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

  def add_thumb(%{valid?: true, changes: %{profile_image_url: url}} = changeset) do
    case Stitch.Accounts.ProfileImage.create_thumb(url) do
      {:ok, profile_image_thumb_url} ->
        put_change(changeset, :profile_image_thumb_url, profile_image_thumb_url)

      {:error, _error} ->
        changeset
    end
  end

  def add_thumb(changeset), do: changeset

  @doc """
  Checks if the user is a guest based on their roles.
  """
  @spec guest?(User.t()) :: boolean
  def guest?(%User{roles: [role]}) when role in @guest_roles, do: true
  def guest?(%User{}), do: false
end