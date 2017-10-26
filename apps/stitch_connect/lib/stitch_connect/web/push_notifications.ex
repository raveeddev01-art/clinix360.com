defmodule StitchConnect.Web.PushNotifications do
  alias Stitch.{Group, GroupQueries, Message, Mobile, Repo}

  def push_new_msg_notification(%Group{} = grp, %Message{} = msg, user_ids) do
    msg = Repo.preload(msg, :user)

    Enum.each user_ids, fn user_id ->
      grp_with_user_data = GroupQueries.load_user_data(grp, user_id)
      push_new_msg_notification_to_user(grp_with_user_data, msg, user_id)
    end
  end

  def push_new_msg_notification_to_user(grp, msg, user_id) do
    %{"ios" => ios_devices, "android" => android_devices} =
      user_id
      |> Mobile.list_user_devices
      |> Enum.group_by(fn device -> device.type end)
      |> Map.put_new("ios", [])
      |> Map.put_new("android", [])

    Enum.each(ios_devices, fn ios_device ->
      push_new_msg_notification_to_ios_device(grp, msg, ios_device)
    end)

    push_new_msg_notification_to_android_devices(grp, msg, android_devices)
  end

  def push_new_msg_notification_to_ios_device(grp, msg, %{type: "ios", token: token}) do
    import Pigeon.APNS.Notification

    new(new_msg_notification_body(grp, msg), token)
    |> put_badge(42)
    |> put_sound("chime")
    |> Pigeon.APNS.push
  end

  def push_new_msg_notification_to_android_devices(grp, msg, android_devices) do
    import Pigeon.FCM.Notification

    android_devices
    |> Enum.map(&(&1.token))
    |> new
    |> put_notification(%{"body" => new_msg_notification_body(grp, msg)})
  end

  def new_msg_notification_body(%{slug: "__dm_group__" <> _}, %{user: user, type: "upload"}) do
    "#{display_name(user)} uploaded a 1-on-1 file."
  end

  def new_msg_notification_body(%{slug: "__dm_group__" <> _}, %{user: user}) do
    "#{display_name(user)} sent you a 1-on-1 message."
  end

  def new_msg_notification_body(%{slug: "__multi_dm_group__" <> _}, %{user: user, type: "upload"}) do
    "#{display_name(user)} uploaded a direct file."
  end

  def new_msg_notification_body(%{slug: "__multi_dm_group__" <> _}, %{user: user}) do
    "#{display_name(user)} sent you a direct message."
  end

  def new_msg_notification_body(_grp, %{user: user, type: "upload"}) do
    "#{display_name(user)} uploaded a room file."
  end

  def new_msg_notification_body(_grp, %{user: user}) do
    "#{display_name(user)} sent a room message."
  end

  defp display_name(%{first_name: first_name, last_name: last_name}) do
    "#{first_name} #{last_name}"
  end
end
