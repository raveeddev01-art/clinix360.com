defmodule UserAgentInfo do
  @moduledoc """
  Helper functions around user agent parsing. Light wrapper around UAInspector.
  """

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
  Gets device type from user agent.
  Return values like: [ 'tablet', 'smartphone', 'browser', 'mobile']
  """
  def device_type(user_agent) do
    case get_device_attr(user_agent, :type) do
      "unknown" -> client_type(user_agent)
      "library" -> client_type(user_agent)
      type -> type
    end
  end

  @doc """
  Gets client name from user agent.
  Return values like: [ 'Microsoft Edge', 'Firefox', 'Safari']

  # Since this module is being used only by singed in users
  # in the main webapp, we know that if the os is iOS or Android
  # they are using the app.
  """
  def client_name(user_agent) do
    case os(user_agent) do
      "iOS" ->
        "iOS App"

      "Android" ->
        "Android App"

      _ ->
        get_client_attr(user_agent, :name)
    end
  end

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
