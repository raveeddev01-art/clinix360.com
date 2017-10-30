defmodule StitchConnect.Web.PushNotifications do
  alias Stitch.{Accounts.User, Group, GroupUser, Message, Mobile, Repo}
  import Ecto.Query

  def push_badge_update(%Message{user_id: author_id, group_id: group_id}) do
    user_ids =
      GroupUser
      |> where(group_id: ^group_id)
      |> where([gu], gu.user_id != ^author_id)
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
    alias Pigeon.APNS
    badge_value = Mobile.badge_value(user)

    user.id
    |> Mobile.list_user_devices
    |> Enum.filter(&(&1.type == "ios"))
    |> Enum.map(fn %{token: token} ->
      %APNS.Notification{device_token: token}
      |> APNS.Notification.put_badge(badge_value)
    end)
    |> APNS.push
  end

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
    push_new_msg_notification_to_ios_devices(grp, msg, badge_value, ios_devices)
    push_new_msg_notification_to_android_devices(grp, msg, android_devices)
  end

  defp push_new_msg_notification_to_ios_devices(grp, msg, badge_value, ios_devices) do
    import Pigeon.APNS.Notification

    ios_devices
    |> Enum.map(fn %{token: token} ->
      grp
      |> new_msg_notification_body(msg)
      |> new(token)
      |> put_badge(badge_value)
      |> put_sound("chime")
    end)
    |> Pigeon.APNS.push
  end

  defp push_new_msg_notification_to_android_devices(grp, msg, android_devices) do
    import Pigeon.FCM.Notification

    android_devices
    |> Enum.map(&(&1.token))
    |> new
    |> put_notification(%{"body" => new_msg_notification_body(grp, msg)})
    |> Pigeon.FCM.push
  end

  defp new_msg_notification_body(%{slug: "__dm_group__" <> _}, %{user: user, type: "upload"}) do
    "#{display_name(user)} uploaded a 1-on-1 file."
  end

  defp new_msg_notification_body(%{slug: "__dm_group__" <> _}, %{user: user}) do
    "#{display_name(user)} sent you a 1-on-1 message."
  end

  defp new_msg_notification_body(%{slug: "__multi_dm_group__" <> _}, %{user: user, type: "upload"}) do
    "#{display_name(user)} uploaded a direct file."
  end

  defp new_msg_notification_body(%{slug: "__multi_dm_group__" <> _}, %{user: user}) do
    "#{display_name(user)} sent you a direct message."
  end

  defp new_msg_notification_body(_grp, %{user: user, type: "upload"}) do
    "#{display_name(user)} uploaded a room file."
  end

  defp new_msg_notification_body(_grp, %{user: user}) do
    "#{display_name(user)} sent a room message."
  end

  defp display_name(%{first_name: first_name, last_name: last_name}) do
    "#{first_name} #{last_name}"
  end
end
