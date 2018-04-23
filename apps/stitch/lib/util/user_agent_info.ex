defmodule UserAgentInfo do
  @moduledoc """
  Helper functions around user agent parsing. Light wrapper around UAInspector.
  """

  # Some of these are quite unlikely but fine to keep
  @mobile_device_types [
    "phone",
    "tablet",
    "smartphone",
    "mobile",
    "smart display",
    "feature phone"
  ]

  @doc """
  Parses a plug conn and returns a user agent
  """
  def parse_conn(conn) do
    case Plug.Conn.get_req_header(conn, "user-agent") do
      [] -> "undefined"
      [user_agent] -> user_agent
    end
  end

  @doc """
  Checks if user agent is mobile
  """
  def is_mobile(user_agent) do
    type = device_type(user_agent)
    Enum.member?(@mobile_device_types, type)
  end

  @doc """
  Checks if user agent is iOS
  """
  def is_ios(user_agent) do
    os(user_agent) == "iOS"
  end

  @doc """
  Checks if user agent is Android
  """
  def is_android(user_agent) do
    os(user_agent) == "Android"
  end

  @doc """
  Gets device type from user agent.
  Return values like: [ 'tablet', 'smarphone', 'browser']
  """
  def device_type(user_agent) do
    case get_device_attr(user_agent, :type) do
      "unknown" -> client_type(user_agent)
      type -> type
    end
  end

  @doc """
  Gets client name from user agent.
  Return values like: [ 'Microsoft Edge', 'Firefox', 'Safari']
  """
  def client_name(user_agent), do: get_client_attr(user_agent, :name)

  @doc """
  Gets device type from user agent.
  Return values like: [ 'iOS', 'Android', 'Windows 10']
  """
  def os(user_agent), do: get_os_attr(user_agent, :name)

  defp client_type(user_agent), do: get_client_attr(user_agent, :type)

  defp get_client_attr(user_agent, attr) do
    parse_and_get(user_agent, :client, attr)
  end

  defp get_device_attr(user_agent, attr) do
    parse_and_get(user_agent, :device, attr)
  end

  defp get_os_attr(user_agent, attr) do
    parse_and_get(user_agent, :os, attr)
  end

  defp parse_and_get(user_agent, attr_a, attr_b) do
    user_agent_struct = parse(user_agent)

    case Map.get(user_agent_struct, attr_a) do
      :unknown -> "unknown"
      nil -> "unknown"
      client -> Map.get(client, attr_b) || "unknown"
    end
  end

  defp parse(user_agent) do
    UAInspector.parse(user_agent)
  end
end
