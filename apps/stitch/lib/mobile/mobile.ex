defmodule Stitch.Mobile do
  import Ecto.Query
  alias Stitch.{Accounts.User, Mobile.Device, Repo}

  def list_user_devices(user_id) do
    from(d in Device, where: d.user_id == ^user_id)
    |> Repo.all
  end

  def register_device(%User{id: user_id}, attrs) do
    %Device{user_id: user_id}
    |> Device.changeset(attrs)
    |> Repo.insert
  end

  def remove_device(type, token) when type in ["ios", "android"] do
    Device
    |> where(type: ^type)
    |> where(token: ^token)
    |> Repo.delete_all
  end

  def badge_value(%User{} = user) do
    Stitch.GroupUser
    |> where(user_id: ^user.id)
    |> Stitch.Repo.all
    |> Enum.reduce(0, fn group_user, acc ->
      notification_preference =
        if group_user.mobile_notification_preference == "default" do
          user.mobile_notification_preference
        else
          group_user.mobile_notification_preference
        end

      case notification_preference do
        "nothing" -> acc
        "mentions" -> group_user.mentions_count + acc
        "everything" -> group_user.unread_messages_count + acc
      end
    end)
  end
end
