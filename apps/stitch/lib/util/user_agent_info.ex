defmodule UserAgentInfo do
  @moduledoc """
  Helper functions around user agent parsing. Light wrapper around UAInspector
  """

  @mobile_device_types ["phone", "tablet", "mobile", "smartphone"]

  @doc """
  Parses a plug conn and returns a user agent
  """
  def parse_conn(conn) do
    [ua] = Plug.Conn.get_req_header(conn, "user-agent")
    ua
  end

  @doc """
  Checks if user agent is mobile
  """
  def is_mobile(ua) do
    type = device_type(ua)
    Enum.member?(@mobile_device_types, type)
  end

  @doc """
  Checks if user agent is desktop
  """
  def is_desktop(ua) do
    !is_mobile(ua)
  end

  @doc """
  Checks if user agent is iOS
  """
  def is_ios(ua) do
    os(ua) == "iOS"
  end

  @doc """
  Checks if user agent is Android
  """
  def is_android(ua) do
    os(ua) == "Android"
  end

  @doc """
  Gets OS Name from user agent
  """
  def os(ua) do
    os = parse(ua).os
    os && os.name
  end

  @doc """
  Gets device type from user agent
  """
  def device_type(ua) do
    case parse(ua).device do
      :unknown -> nil
      device -> device.type
    end
  end

  def client_name(ua) do
    client = parse(ua).client
    client && client.name
  end

  defp parse(ua) do
    UAInspector.parse(ua)
  end
end
