defmodule Stitch.TimedMessage.Helper do
  @moduledoc """
  Contains lambdas for:
  - loading data
  - setting subjects
  - determining sending
  - assigning variables
  """

  @typedoc """
  Loaded data res
  """
  @type loaded_data :: {:ok, map}

  @typedoc """
  sendable_res
  """
  @type sendable_res :: :ok | :not_sendable

  use Bamboo.Phoenix, view: Stitch.EmailView
  alias Stitch.{Repo, Accounts.User, MessageQueries, Invitation}

  # ================
  # ================
  #   LOADING DATA
  # ================
  # ================

  @doc """
  Loads a user given given a map with user_id. Returns data map.
  """
  @spec get_user(map) :: loaded_data
  def get_user(data) do
    user = Repo.get(User, data["user_id"])
    {:ok, Map.put(data, "user", user)}
  end

  @doc """
  Loads a user and invitation given a map with invitation_id. Returns data map.
  """
  @spec get_invitation_and_user(map) :: loaded_data
  def get_invitation_and_user(data) do
    invitation =
      Invitation
      |> Repo.get(data["invitation_id"])
      |> Repo.preload(user: :team)

    new_data =
      data
      |> Map.put("invitation", invitation)
      |> Map.put("user", invitation.user)

    {:ok, new_data}
  end

  @doc """
  Loads a user and team given a map with user_id. Returns data map.
  """
  @spec get_user_with_team(map) :: loaded_data
  def get_user_with_team(data) do
    user =
      User
      |> Repo.get(data["user_id"])
      |> Repo.preload(:team)

    {:ok, Map.put(data, "user", user)}
  end

  @doc """
  Loads a user, team, and invites given a map with user_id. Returns data map.
  """
  @spec get_user_with_team_invites(map) :: loaded_data
  def get_user_with_team_invites(data) do
    user =
      User
      |> Repo.get(data["user_id"])
      |> Repo.preload(team: :invitations)

    {:ok, Map.put(data, "user", user)}
  end

  @doc """
  Given a map with user_id, checks if mobile message was sent.
  Returns data map with "has_sent_mobile_message" key.
  """
  @spec get_user_with_mobile_message_check(map) :: loaded_data
  def get_user_with_mobile_message_check(data) do
    user = Repo.get(User, data["user_id"])
    has_sent_mobile_message = MessageQueries.has_sent_mobile_message(data["user_id"])

    loaded_data =
      data
      |> Map.put("user", user)
      |> Map.put("has_sent_mobile_message", has_sent_mobile_message)

    {:ok, loaded_data}
  end

  # ================
  # ================
  #   SET SUBJECT
  # ================
  # ================

  @doc """
  Returns a subject for welcome emails given a user with team loaded.
  """
  @spec welcome_subject(map) :: String.t()
  def welcome_subject(%{"user" => user}) do
    "#{user.team.name} on Stitch: New Account Information"
  end

  # ================
  # ================
  #     SEND IF
  # ================
  # ================

  @spec is_active_user(map) :: sendable_res
  def is_active_user(%{"user" => user}) do
    sendable = user.onboarded && !user.disabled
    if sendable, do: :ok, else: :not_sendable
  end

  @spec has_team(map) :: sendable_res
  def has_team(%{"user" => user}) do
    sendable = user.team
    if sendable, do: :ok, else: :not_sendable
  end

  @spec is_active_and_has_team(map) :: sendable_res
  def is_active_and_has_team(data) do
    with :ok <- is_active_user(data),
         :ok <- has_team(data) do
      :ok
    else
      _ -> :not_sendable
    end
  end

  @spec has_not_invited_users(map) :: sendable_res
  def has_not_invited_users(%{"user" => user}) do
    sendable = length(user.team.invitations) < 1
    if sendable, do: :ok, else: :not_sendable
  end

  @spec has_not_set_profile(map) :: sendable_res
  def has_not_set_profile(%{"user" => user}) do
    sendable = User.has_default_image(user)
    if sendable, do: :ok, else: :not_sendable
  end

  @spec is_active_and_not_sent_mobile_message(map) :: sendable_res
  def is_active_and_not_sent_mobile_message(data) do
    with :ok <- is_active_user(data),
         :ok <- has_not_sent_mobile_message(data) do
      :ok
    else
      _ -> :not_sendable
    end
  end

  @spec is_invitation_pending(map) :: sendable_res
  def is_invitation_pending(%{"invitation" => invitation}) do
    sendable = invitation && !invitation.accepted
    if sendable, do: :ok, else: :not_sendable
  end

  @spec has_not_sent_mobile_message(map) :: sendable_res
  def has_not_sent_mobile_message(%{"has_sent_mobile_message" => false}), do: :ok
  def has_not_sent_mobile_message(_data), do: :not_sendable

  @spec user_has_invite_permissions(map) :: sendable_res
  def user_has_invite_permissions(%{"user" => user}) do
    sendable = user.team.open_invitations_enabled
    if sendable, do: :ok, else: :not_sendable
  end

  # ================
  # ================
  #  ASSIGNING VARS
  # ================
  # ================

  def with_user_and_team_attrs(email, %{"user" => user}) do
    email
    |> assign(:user_email, user.email)
    |> assign(:team_name, user.team.name)
    |> assign(:team_login_url, "#{user.team.slug}.#{System.get_env("APP_HOST")}")
  end

  def with_invitation_attrs(email, params = %{"user" => user, "invitation" => invitation}) do
    email
    |> with_user_and_team_attrs(params)
    |> assign(
      :invitation_accept_url,
      "#{user.team.slug}.#{System.get_env("APP_HOST")}/invitations/accept/#{
        invitation.invite_token
      }"
    )
  end

  def with_download_app_link(email, _params) do
    email
    |> assign(:download_app_link, "https://teamstitch.com/downloads")
  end

  def with_notifications_link(email, params = %{"user" => user}) do
    email
    |> with_user_and_team_attrs(params)
    |> assign(
      :notifications_link,
      "#{user.team.slug}.#{System.get_env("APP_HOST")}/admin/you/notifications"
    )
  end

  def with_complete_profile_link(email, params = %{"user" => user}) do
    email
    |> with_user_and_team_attrs(params)
    |> assign(
      :complete_profile_link,
      "#{user.team.slug}.#{System.get_env("APP_HOST")}/admin/you/profile"
    )
  end

  def with_admin_invitation_attrs(email, params = %{"user" => user}) do
    email
    |> with_user_and_team_attrs(params)
    |> assign(
      :invite_others_link,
      "#{user.team.slug}.#{System.get_env("APP_HOST")}/admin/members"
    )
  end

  def with_member_invitation_attrs(email, params = %{"user" => user}) do
    email
    |> with_user_and_team_attrs(params)
    |> assign(
      :invite_others_link,
      "#{user.team.slug}.#{System.get_env("APP_HOST")}"
    )
  end
end
