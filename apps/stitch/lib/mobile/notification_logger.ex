defmodule Stitch.Mobile.NotificationLogger do
  require Logger

  def start(message, recipients) do
    json =
      Poison.encode!(%{
        type: "push_notification_start",
        message_id: message.id,
        recipients: recipients
      })
    Logger.info("[push-notifications] #{json}")
  end

  def send(message, user, device, platform) when platform in ["ios", "android"] do
    json =
      Poison.encode!(%{
        type: "push_notification_send",
        user_id: user.id,
        platform: platform,
        message_id: message.id,
        device_id: device.id
      })
    Logger.info("[push-notifications] #{json}")
  end

  def response(%{payload: %{message_id: message_id, user_id: user_id, device_id: device_id}, response: response}) do
    json =
      Poison.encode!(%{
        type: "push_notification_response",
        message_id: message_id,
        user_id: user_id,
        device_id: device_id,
        response: response,
        platform: "ios",
      })
    Logger.info("[push-notifications] #{json}")
  end

  def response(%{payload: %{"data" => %{"message_id" => message_id, "user_id" => user_id, "device_id" => device_id}}, response: response}) do
    json =
      Poison.encode!(%{
        type: "push_notification_response",
        message_id: message_id,
        user_id: user_id,
        device_id: device_id,
        response: parse_android_response(response),
        platform: "android",
      })
    Logger.info("[push-notifications] #{json}")
  end

  def response(_notification), do: nil

  defp parse_android_response(response) when is_list(response) do
    response
    |> Enum.into(%{})
    |> parse_android_response()
  end
  defp parse_android_response(response), do: response
end
