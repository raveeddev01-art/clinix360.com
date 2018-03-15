defmodule StitchConnect.Web.PushNotifications do
  alias Stitch.{Accounts.User, Group, GroupUser, Message, Mobile, Repo}
  alias Pigeon.{APNS, FCM}
  import Ecto.Query
  require Logger

  @apns_topic Application.get_env(:stitch_connect, :apns_topic)

  def apns_push(notification, opts \\ []) do
    fun = Application.get_env(:stitch_connect, :apns_push, &APNS.push/2)
    fun.(notification, opts)
  end

  def fcm_push(notification, opts \\ []) do
    fun = Application.get_env(:stitch_connect, :fcm_push, &FCM.push/2)
    fun.(notification, opts)
  end

  @doc """
  Trigger a new message notification for users.
  """
  @spec notify_users(Group.t(), Message.t(), list(number)) :: {:ok, binary}
  def notify_users(_group, %Message{type: "system"}, _user_ids), do: nil

  def notify_users(%Group{} = group, %Message{} = message, user_ids) do
    message = Repo.preload(message, :user)

    users =
      User
      |> where([u], u.id in ^user_ids)
      |> where(disabled: false)
      |> Repo.all()

    Enum.each(users, fn user ->
      Logger.info(
        "[notifications] - #{user.id} - #{user.email}: Starting notifications for user."
      )

      notify_user(group, message, user)
    end)

    {:ok, "Notifications sent out successfully."}
  end

  defp notify_user(group, message, user) do
    %{"ios" => ios_devices, "android" => android_devices} =
      user.id
      |> Mobile.list_user_devices()
      |> Enum.group_by(fn device -> device.type end)
      |> Map.put_new("ios", [])
      |> Map.put_new("android", [])

    badge_value = Mobile.badge_value(user)
    group_user = Repo.get_by(GroupUser, user_id: user.id, group_id: group.id)
    room_notification_count = Mobile.room_notification_count(user, group_user)

    # Notify the user on any iOS devices.
    notify_user_ios_devices(user, group, message, badge_value, ios_devices)

    # Notify the user on any Android devices.
    notify_user_android_devices(
      user,
      group,
      message,
      badge_value,
      room_notification_count,
      android_devices
    )
  end

  defp notify_user_ios_devices(_user, _group, _message, _badge_value, []), do: nil
  defp notify_user_ios_devices(user, group, message, badge_value, ios_devices) do
    import APNS.Notification

    Logger.info("[notifications] - #{user.id} - #{user.email}: Going to notify iOS devices.")

    ios_devices
    |> Enum.map(fn %{token: token} ->
      group
      |> notification_text_body(message, user)
      |> new(token, @apns_topic)
      |> put_badge(badge_value)
      |> put_sound("chime")
      |> put_custom(%{ejson: sanitize_notification_payload(message)})
    end)
    |> apns_push(on_response: &handle_apns_push/1)
  end

  defp notify_user_android_devices(_user, _group, _message, _badge_value, _room_notification_count, []), do: nil
  defp notify_user_android_devices(
         user,
         group,
         message,
         badge_value,
         room_notification_count,
         android_devices
       ) do
    import FCM.Notification

    Logger.info("[notifications] - #{user.id} - #{user.email}: Going to notify Android devices.")

    android_devices
    |> Enum.map(& &1.token)
    |> new
    |> put_data(%{
      "badge" => to_string(badge_value),
      "room_notification_count" => room_notification_count,
      "message" => notification_text_body(group, message, user),
      "ejson" => message |> sanitize_notification_payload |> Poison.encode!()
    })
    |> fcm_push(on_response: &handle_fcm_push/1)
  end

  defp sanitize_notification_payload(message) do
    message
    |> Repo.preload(:user)
    |> StitchConnect.Web.Api.V1.MessageView.message_json()
    |> Map.drop([:text_content, :fields])
  end

  defp notification_text_body(%{name: group_name}, %{user: user, type: "upload"}, _receiver)
       when group_name in ~w[__dm_group__ __multi_dm_group__] do
    "#{user.first_name} #{user.last_name} uploaded a direct file."
  end

  defp notification_text_body(%{name: group_name}, %{user: user}, _receiver)
      when group_name in ~w[__dm_group__ __multi_dm_group__] do
    "#{user.first_name} #{user.last_name} sent you a direct message."
  end

  defp notification_text_body(%{name: group_name}, %{user: user, type: "upload"}, _receiver) do
    "#{user.first_name} #{user.last_name} uploaded a room file (#{group_name})."
  end

  defp notification_text_body(%{name: group_name}, %{user: author} = message, receiver) do
    if receiver.id in message.mentioned_user_ids do
      "#{author.first_name} #{author.last_name} mentioned you in #{group_name}."
    else
      "#{author.first_name} #{author.last_name} sent a room message (#{group_name})."
    end
  end

  # Badge number updates.

  def push_badge_update(msg, exclude_user_ids \\ [])
  def push_badge_update(%Message{type: "system"}, _exclude_user_ids), do: nil

  def push_badge_update(%Message{group_id: group_id}, exclude_user_ids) do
    user_ids =
      GroupUser
      |> where(group_id: ^group_id)
      |> where([gu], gu.user_id not in ^exclude_user_ids)
      |> select([gu], gu.user_id)
      |> Repo.all()

    users =
      Stitch.Accounts.User
      |> where([u], u.id in ^user_ids)
      |> where(disabled: ^false)
      |> Repo.all()

    Enum.each(users, fn user ->
      push_badge_update_to_user(user)
    end)
  end

  def push_badge_update_to_user(user) do
    badge_value = Mobile.badge_value(user)

    %{"ios" => ios_devices, "android" => android_devices} =
      user.id
      |> Mobile.list_user_devices()
      |> Enum.group_by(fn device -> device.type end)
      |> Map.put_new("ios", [])
      |> Map.put_new("android", [])

    push_badge_update_to_ios_devices(user, badge_value, ios_devices)
    push_badge_update_to_android_devices(user, badge_value, android_devices)
  end

  defp push_badge_update_to_ios_devices(_user, _badge_value, []), do: nil

  defp push_badge_update_to_ios_devices(user, badge_value, ios_devices) do
    Logger.info(
      "[notifications.badge] - #{user.id} - #{user.email}: Updating badge for iOS devices value: #{
        badge_value
      }"
    )

    ios_devices
    |> Enum.map(fn %{token: token} ->
      %APNS.Notification{device_token: token, topic: @apns_topic}
      |> APNS.Notification.put_badge(badge_value)
    end)
    |> apns_push(on_response: &handle_apns_push/1)
  end

  defp push_badge_update_to_android_devices(_user, _badge_value, []), do: nil

  defp push_badge_update_to_android_devices(user, badge_value, android_devices) do
    import FCM.Notification

    Logger.info(
      "[notifications.badge] - #{user.id} - #{user.email}: Updating badge for Android devices value: #{
        badge_value
      }"
    )

    android_devices
    |> Enum.map(& &1.token)
    |> new
    |> put_data(%{"badge" => to_string(badge_value)})
    |> fcm_push(on_response: &handle_fcm_push/1)
  end

  # fcm push response handlers.
  def handle_fcm_push(notification) do
    notification
    |> log_fcm_errors()
    |> FCM.Notification.remove?()
    |> Enum.each(&Mobile.remove_device("android", &1))
  end

  def log_fcm_errors(notification) do
    notification.response
    |> Enum.each(fn
      {:success, token} ->
        Logger.info("Android PN was successful. #{inspect(token)}")

      {response_error, token} ->
        error = %{response: response_error, device_token: token, platform: "Android"}
        Logger.info(inspect(error))
    end)

    notification
  end

  # apns push response handlers.
  def handle_apns_push(%{response: :success}) do
    Logger.info("iOS PN was successful.")
  end

  def handle_apns_push(%{response: response, device_token: token})
      when response in [:bad_device_token, :unregistered] do
    error = %{response: response, device_token: token, platform: "iOS"}
    Logger.info(inspect(error))
    Mobile.remove_device("ios", token)
  end

  def handle_apns_push(%{response: response_error, device_token: token}) do
    error = %{response: response_error, device_token: token, platform: "iOS"}
    Logger.info(inspect(error))
  end
end
