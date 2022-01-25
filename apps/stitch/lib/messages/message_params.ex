defmodule Stitch.Message.Params do
  @moduledoc """
  Helper functions around making message params.
  """

  import UserAgentInfo

  @bot_client_params %{
    "client_name" => "bot",
    "client_os" => "bot",
    "client_device_type" => "bot"
  }

  # Only old mobile clients would use the
  # channel to send messages. We don't have
  # their userAgent info, but we can infer a bit.
  @channel_client_params %{
    "client_name" => "smartphone",
    "client_os" => "unknown",
    "client_device_type" => "unknown"
  }

  @doc """
  Combines given params with client-specific info.
  Taken from user agent from conn, or channel/bot defaults.
  """
  def with_client_attrs("bot", params) do
    Map.merge(@bot_client_params, params)
  end

  def with_client_attrs("channel", params) do
    Map.merge(@channel_client_params, params)
  end

  def with_client_attrs(conn, params) do
    IO.inspect(params, label: "here is params in with_client_attrs")
    ua = parse_conn(conn)


    client_params = %{
      "client_device_type" => device_type(ua),
      "client_os" => os(ua),
      "client_name" => client_name(ua)
    }

    Map.merge(client_params, params) |> IO.inspect(label: "here is message_params")
  end
end
