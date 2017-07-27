defmodule Stitch.Accounts.Admin do
  @moduledoc """
  The Accounts Admin context. Operations for administering a
  users account.
  """

  alias Stitch.Repo

  @spec update_firstname_and_lastname(number, String.t, String.t) :: {:ok, term} | {:error, term}
  @doc """
  Updates the user firstname and lastname field.
  """
  def update_firstname_and_lastname(user_id, firstname, lastname) do
    # TODO
  end

  @spec update_phone_number(number, String.t) :: {:ok, term} | {:error, term}
  @doc """
  Updates the user phone_number field.
  """
  def update_phone_number(user_id, phone_number) do
    # TODO
  end

  @spec update_title(number, String.t) :: {:ok, term} | {:error, term}
  @doc """
  Updates the user title field.
  """
  def update_title(user_id, title) do
    # TODO
  end

  @spec update_profile_image_url(number, String.t) :: {:ok, term} | {:error, term}
  @doc """
  Updates the user profile_image_url field.
  """
  def update_profile_image_url(user_id, profile_image_url) do
    # TODO
  end

  @spec update_username(number, String.t) :: {:ok, term} | {:error, term}
  @doc """
  Updates the user username field.
  """
  def update_username(user_id, username) do
    # TODO
  end

  @spec update_email(number, String.t) :: {:ok, term} | {:error, term}
  @doc """
  Updates the user email field.
  """
  def update_email(user_id, email) do
    # TODO
  end

  @spec update_password(number, String.t) :: {:ok, term} | {:error, term}
  @doc """
  Updates the user encrypted_password field.
  """
  def update_password(user_id, password) do
    # TODO
  end

  @spec update_pin(number, String.t) :: {:ok, term} | {:error, term}
  @doc """
  Updates the user pin field.
  """
  def update_pin(user_id, pin) do
    # TODO
  end

  @spec update_unread_message_notification_interval(number, number) :: {:ok, term} | {:error, term}
  @doc """
  Updates the user unread_message_notification_interval field.
  """
  def update_unread_message_notification_interval(user_id, notification_interval) do
    # TODO
  end
end