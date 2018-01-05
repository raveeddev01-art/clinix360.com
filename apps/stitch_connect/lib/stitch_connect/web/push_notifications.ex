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

  def push_badge_update(msg, exclude_user_ids \\ [])
  def push_badge_update(%Message{type: "system"}, _exclude_user_ids), do: nil
  def push_badge_update(%Message{group_id: group_id}, exclude_user_ids) do
    user_ids =
      GroupUser
      |> where(group_id: ^group_id)
      |> where([gu], gu.user_id not in ^exclude_user_ids)
      |> select([gu], gu.user_id)
      |> Repo.all

    users =
      Stitch.Accounts.User
      |> where([u], u.id in ^user_ids)
      |> where(disabled: ^false)
      |> Repo.all

    Enum.each users, fn user ->
      push_badge_update_to_user(user)
    end
  end

  def push_badge_update_to_user(user) do
    badge_value = Mobile.badge_value(user)

    %{"ios" => ios_devices, "android" => android_devices} =
      user.id
      |> Mobile.list_user_devices
      |> Enum.group_by(fn device -> device.type end)
      |> Map.put_new("ios", [])
      |> Map.put_new("android", [])

    push_badge_update_to_ios_devices(badge_value, ios_devices)
    push_badge_update_to_android_devices(badge_value, android_devices)
  end

  defp push_badge_update_to_ios_devices(badge_value, ios_devices) do
    Logger.info "Sending Badge Update to iOS"
    Logger.info(inspect(badge_value))
    Logger.info(inspect(ios_devices))
    ios_devices
    |> Enum.map(fn %{token: token} ->
      %APNS.Notification{device_token: token, topic: @apns_topic}
      |> APNS.Notification.put_badge(badge_value)
    end)
    |> apns_push(on_response: &handle_response_ios/1)
  end

  defp push_badge_update_to_android_devices(badge_value, android_devices) do
    import FCM.Notification
    Logger.info "Sending Badge Update to Android"
    Logger.info(inspect(badge_value))
    Logger.info(inspect(android_devices))
    android_devices
    |> Enum.map(&(&1.token))
    |> new
    |> put_data(%{"badge" => to_string(badge_value)})
    |> fcm_push(on_response: &handle_response_andriod/1)
  end

  def push_new_msg_notification(_grp, %Message{type: "system"}, _user_ids), do: nil
  def push_new_msg_notification(%Group{} = grp, %Message{} = msg, user_ids) do
    msg = Repo.preload(msg, :user)

    users =
      Stitch.Accounts.User
      |> where([u], u.id in ^user_ids)
      |> where(disabled: ^false)
      |> Repo.all

    Enum.each users, fn user ->
      push_new_msg_notification_to_user(grp, msg, user)
    end
  end

  defp push_new_msg_notification_to_user(grp, msg, %User{id: user_id} = user) do
    %{"ios" => ios_devices, "android" => android_devices} =
      user_id
      |> Mobile.list_user_devices
      |> Enum.group_by(fn device -> device.type end)
      |> Map.put_new("ios", [])
      |> Map.put_new("android", [])

    badge_value = Mobile.badge_value(user)
    group_user = Repo.get_by(GroupUser, user_id: user.id, group_id: grp.id)
    room_notification_count = Mobile.room_notification_count(user, group_user)
    push_new_msg_notification_to_ios_devices(grp, msg, badge_value, ios_devices)
    push_new_msg_notification_to_android_devices(grp, msg, badge_value, room_notification_count, android_devices)
  end

  defp push_new_msg_notification_to_ios_devices(grp, msg, badge_value, ios_devices) do
    import APNS.Notification

    Logger.info "Sending PN to iOS"
    Logger.info(inspect(new_msg_notification_body(grp, msg)))
    Logger.info(inspect(badge_value))
    Logger.info(inspect(ios_devices))
    Logger.info("=====")

    ios_devices
    |> Enum.map(fn %{token: token} ->
      grp
      |> new_msg_notification_body(msg)
      |> new(token, @apns_topic)
      |> put_badge(badge_value)
      |> put_sound("chime")
      |> put_custom(%{ejson: new_msg_notification_custom_data(msg)})
    end)
    |> apns_push(on_response: &handle_response_ios/1)
  end

  defp push_new_msg_notification_to_android_devices(grp, msg, badge_value, room_notification_count, android_devices) do
    import FCM.Notification

    Logger.info "Sending PN to Android"
    Logger.info(inspect(new_msg_notification_body(grp, msg)))
    Logger.info(inspect(badge_value))
    Logger.info(inspect(android_devices))
    Logger.info("=====")

    android_devices
    |> Enum.map(&(&1.token))
    |> new
    |> put_data(%{
      "badge" => to_string(badge_value),
      "room_notification_count" => room_notification_count,
      "message" => new_msg_notification_body(grp, msg),
      "ejson" => msg |> new_msg_notification_custom_data |> Poison.encode!
    })
    |> fcm_push(on_response: &handle_response_andriod/1)
  end

  defp new_msg_notification_body(%{name: group_name}, %{user: user, type: "upload"})
       when group_name in ~w[__dm_group__ __multi_dm_group__] do
    "#{display_name(user)} uploaded a direct file."
  end

  defp new_msg_notification_body(%{name: group_name}, %{user: user})
       when group_name in ~w[__dm_group__ __multi_dm_group__] do
    "#{display_name(user)} sent you a direct message."
  end

  defp new_msg_notification_body(%{name: group_name}, %{user: user, type: "upload"}) do
    "#{display_name(user)} uploaded a room file (#{group_name})."
  end

  defp new_msg_notification_body(%{name: group_name}, %{user: user}) do
    "#{display_name(user)} sent a room message (#{group_name})."
  end

  defp display_name(%{first_name: first_name, last_name: last_name}) do
    "#{first_name} #{last_name}"
  end

  defp new_msg_notification_custom_data(msg) do
    msg
    |> Repo.preload(:user)
    |> StitchConnect.Web.Api.V1.MessageView.message_json
    |> Map.drop([:text_content, :fields])
  end

  def handle_response_andriod(notification) do
    notification
    |> log_fcm_errors()
    |> FCM.Notification.remove?()
    |> Enum.each(& Mobile.remove_device("android", &1))
  end

  def log_fcm_errors(notification) do
    notification.response |> Enum.each(fn
      {:success, token} ->
        Logger.info("Android PN was successful. #{inspect(token)}")
      {response_error, token} ->
        error = %{response: response_error, device_token: token, platform: "Android"}
        Logger.info(inspect(error))
    end)
    notification
  end

  def handle_response_ios(%{response: response, device_token: token})
      when response in [:bad_device_token, :unregistered] do
    error = %{response: response, device_token: token, platform: "iOS"}
    Logger.info(inspect(error))
    Mobile.remove_device("ios", token)
  end
  def handle_response_ios(%{response: :success}) do
    Logger.info("iOS PN was successful.")
  end
  def handle_response_ios(%{response: response_error, device_token: token}) do
    error = %{response: response_error, device_token: token, platform: "iOS"}
    Logger.info(inspect(error))
  end
end
