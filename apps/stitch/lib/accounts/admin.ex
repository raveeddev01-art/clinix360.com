defmodule Stitch.Accounts.Admin do
  @moduledoc """
  The Accounts Admin context. Operations for administering a
  users account.
  """

  alias Stitch.Repo
  alias Stitch.User

  @doc """
  Sets the disabled boolean flag to true for the provided user.
  """
  def deactivate(user_id) do
    Repo.get(User, user_id)
    |> Ecto.Changeset.change(disabled: true)
    |> Repo.update
  end

  @spec update_firstname_and_lastname(number, String.t, String.t) :: {:ok, term} | {:error, term}
  @doc """
  Updates the user firstname and lastname field.
  """
  def update_firstname_and_lastname(user_id, firstname, lastname)
  when byte_size(firstname) > 0 and byte_size(lastname) > 0 do
    user = Repo.get(User, user_id)
    changeset = User.changeset(user, %{first_name: firstname, last_name: lastname})
    Repo.update changeset
  end
  def update_firstname_and_lastname(_, _, _), do: {:error, "First name and last name cannot be blank or nil"}

  @spec update_phone_number(number, String.t) :: {:ok, term} | {:error, term}
  @doc """
  Updates the user phone_number field.
  """
  def update_phone_number(user_id, phone_number)
  when byte_size(phone_number) > 0 do
    user = Repo.get(User, user_id)
    changeset = User.changeset(user, %{phone_number: phone_number})
    Repo.update changeset
  end
  def update_phone_number(_, _), do: {:error, "Phone number cannot be blank or nil"}

  @spec update_title(number, String.t) :: {:ok, term} | {:error, term}
  @doc """
  Updates the user title field.
  """
  def update_title(user_id, title)
  when byte_size(title) > 0 do
    user = Repo.get(User, user_id)
    changeset = User.changeset(user, %{title: title})
    Repo.update changeset
  end
  def update_title(_, _), do: {:error, "Title cannot be blank or nil"}

  @spec update_profile_image_url(number, String.t) :: {:ok, term} | {:error, term}
  @doc """
  Updates the user profile_image_url field.
  """
  def update_profile_image_url(user_id, profile_image_url)
  when byte_size(profile_image_url) > 0 do
    user = Repo.get(User, user_id)
    changeset = User.changeset(user, %{profile_image_url: profile_image_url})
    Repo.update changeset
  end
  def update_profile_image_url(_, _), do: {:error, "Profile image url cannot be blank or nil"}

  @spec update_username(number, String.t) :: {:ok, term} | {:error, term}
  @doc """
  Updates the user username field.
  """
  def update_username(user_id, username)
  when byte_size(username) > 0 do
    user = Repo.get(User, user_id)
    changeset = User.changeset(user, %{username: username})
    Repo.update changeset
  end
  def update_username(_, _), do: {:error, "Username cannot be blank or nil"}

  @spec update_email(number, String.t) :: {:ok, term} | {:error, term}
  @doc """
  Updates the user email field.
  """
  def update_email(user_id, email)
  when byte_size(email) > 0 do
    user = Repo.get(User, user_id)
    changeset = User.changeset(user, %{email: email})
    Repo.update changeset
  end
  def update_email(_, _), do: {:error, "Email cannot be blank or nil"}


  @spec update_password(number, String.t) :: {:ok, term} | {:error, term}
  @doc """
  Updates the user encrypted_password field.
  """
  def update_password(user_id, password)
  when byte_size(password) > 0 do
    user = Repo.get(User, user_id)
    changeset = User.password_update_changeset(user, %{password: password})
    Repo.update changeset
  end
  def update_password(_, _), do: {:error, "Password cannot be blank or nil"}

  @spec update_pin(number, String.t) :: {:ok, term} | {:error, term}
  @doc """
  Updates the user pin field.
  """
  def update_pin(user_id, pin)
  when byte_size(pin) == 4 do
    user = Repo.get(User, user_id)
    changeset = User.changeset(user, %{pin: pin})
    Repo.update changeset
  end
  def update_pin(_, _), do: {:error, "Pin cannot be blank or nil"}

  @spec update_unread_message_notification_interval(number, number) :: {:ok, term} | {:error, term}
  @doc """
  Updates the user unread_message_notification_interval field.
  """
  def update_unread_message_notification_interval(user_id, notification_interval) do
    # TODO
  end
end