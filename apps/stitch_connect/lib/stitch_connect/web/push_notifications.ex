defmodule StitchConnect.Web.PushNotifications do
  alias Stitch.{Accounts.User, Group, GroupUser, Message, Mobile, Repo}
  alias Pigeon.{APNS, FCM}
  import Ecto.Query
  require Logger

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
    ios_devices
    |> Enum.map(fn %{token: token} ->
      %APNS.Notification{device_token: token}
      |> APNS.Notification.put_badge(badge_value)
    end)
    |> APNS.push(on_response: &handle_response_ios/1)
  end

  defp push_badge_update_to_android_devices(badge_value, android_devices) do
    import FCM.Notification

    android_devices
    |> Enum.map(&(&1.token))
    |> new
    |> put_data(%{"badge" => to_string(badge_value)})
    |> FCM.push(on_response: &handle_response_andriod/1)
  end

  def push_new_msg_notification(_grp, %Message{type: "system"}, _user_ids), do: nil
  def push_new_msg_notification(%Group{} = grp, %Message{} = msg, user_ids) do
    msg = Repo.preload(msg, :user)

    users =
      Stitch.Accounts.User
      |> where([u], u.id in ^user_ids)
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
    apns_topic = Application.get_env(:stitch_connect, :apns_topic)

    ios_devices
    |> Enum.map(fn %{token: token} ->
      grp
      |> new_msg_notification_body(msg)
      |> new(token, apns_topic)
      |> put_badge(badge_value)
      |> put_sound("chime")
      |> put_custom(%{ejson: new_msg_notification_custom_data(msg)})
    end)
    |> APNS.push(on_response: &handle_response_ios/1)
  end

  defp push_new_msg_notification_to_android_devices(grp, msg, badge_value, room_notification_count, android_devices) do
    import FCM.Notification

    android_devices
    |> Enum.map(&(&1.token))
    |> new
    |> put_data(%{
      "badge" => to_string(badge_value),
      "room_notification_count" => room_notification_count,
      "message" => new_msg_notification_body(grp, msg),
      "ejson" => msg |> new_msg_notification_custom_data |> Poison.encode!
    })
    |> FCM.push(on_response: &handle_response_andriod/1)
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
    |> FCM.Notification.remove?()
    |> Enum.each(& Mobile.remove_device("android", &1))
  end

  def handle_response_ios(%{response: :bad_device_token, device_token: token}) do
    Mobile.remove_device("ios", token)
  end
  def handle_response_ios(%{response: :success}), do: nil
  def handle_response_ios(%{response: response_error, device_token: token}) do
    Logger.info(inspect(%{response: response_error, device_token: token}))
  end
end
