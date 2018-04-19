defmodule Stitch.Message.Params do
  @moduledoc """
  Helper functions around making message params.
  """

  import UserAgentInfo

  @bot_params %{
    "client_type" => "bot",
    "client_os" => "bot",
    "client_device" => "bot",
    "client_is_mobile" => false
  }

  # Web doesn't use channel anymore,
  # but we don't have specific info on
  # device type
  @channel_params %{
    "client_type" => "smartphone",
    "client_os" => "unknown",
    "client_device" => "unknown",
    "client_is_mobile" => true
  }

  @doc """
  Combines given params with client-specific info.
  Taken from user agent from conn, or channel/bot defaults.
  """
  def with_client_attrs("bot", params) do
    Map.merge(@bot_params, params)
  end

  def with_client_attrs("channel", params) do
    Map.merge(@channel_params, params)
  end

  def with_client_attrs(conn, params) do
    ua = parse_conn(conn)

    client_params = %{
      "client_type" => device_type(ua),
      "client_os" => os(ua),
      "client_is_mobile" => is_mobile(ua),
      "client_device" => client_name(ua)
    }

    Map.merge(client_params, params)
  end
end
