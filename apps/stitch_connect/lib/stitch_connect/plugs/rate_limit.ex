defmodule StitchConnect.Plug.RateLimit do
  import Plug.Conn
  import Phoenix.Controller, only: [json: 2]
  
  def rate_limit_authentication(conn, options \\ []) do
    case conn.assigns do
      %{current_user: user} ->
        options = Dict.merge(options, [bucket_name: "authorization:" <> user.email])
        rate_limit(conn, options)
      _ ->
        rate_limit(conn, options)
    end
  end

  def rate_limit(conn, options \\ []) do
    case check_rate(conn, options) do
      {:ok, _count}   -> conn # Do nothing, allow execution to continue
      {:fail, _count} -> render_error(conn)
    end
  end

  defp check_rate(conn, options) do
    interval_milliseconds = options[:interval_seconds] * 1000
    max_requests = options[:max_requests]
    bucket_name = options[:bucket_name] || bucket_name(conn)
  
    ExRated.check_rate(bucket_name, interval_milliseconds, max_requests)
  end

  # Bucket name should be a combination of ip address and request path, like so:
  #
  # "127.0.0.1:/api/v1/authorizations"
  defp bucket_name(conn) do
    path = Enum.join(conn.path_info, "/")
    ip   = conn.remote_ip |> Tuple.to_list |> Enum.join(".")
    "#{ip}:#{path}"
  end

  defp render_error(conn) do
    conn
    |> put_status(:forbidden)
    |> json(%{error: "Rate limit exceeded."})
    |> halt
  end
end
  