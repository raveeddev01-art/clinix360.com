defmodule Stitch.Web.Plug.PlugAttack do
  import Plug.Conn
  use PlugAttack

  # For more rules examples see PlugAttack.rule/2 macro documentation

  ##### if you want to allow your local server then uncomment below lines

  # rule "allow local", conn do
  #   allow conn.remote_ip == {127, 0, 0, 1}
  # end

  rule "block 1.2.3.4", conn do
    block conn.remote_ip == {1, 2, 3, 4}
  end

  rule "throttle per ip", conn do
    # throttle to 5 requests per minute
    if conn.method == "POST" and conn.path_info == ["api", "v1", "session-unlock"] do
      throttle conn.remote_ip,
        period: 60_000, limit: 5,
        storage: {PlugAttack.Storage.Ets, Stitch.Web.Plug.PlugAttack.Storage}
    end
  end

  rule "throttle login requests", conn do
    if conn.method == "POST" and conn.path_info == ["api", "v1","login"] do
      throttle conn.params["email"],
        period: 60_000, limit: 5,
        storage: {PlugAttack.Storage.Ets, Stitch.Web.Plug.PlugAttack.Storage}
    end
  end

  rule "throttle forget password requests", conn do
    if conn.method == "POST" and conn.path_info == ["api", "v1","reset_password"] do
      throttle conn.params["email"],
        period: 60_000, limit: 5,
        storage: {PlugAttack.Storage.Ets, Stitch.Web.Plug.PlugAttack.Storage}
    end
  end

  # It's possible to customize what happens when conn is let through
  def allow_action(conn, _data, _opts) do
    conn
  end


  # Or when it's blocked
  def block_action(conn, _data, _opts) do
    conn
    |> send_resp(:forbidden, "Forbidden, Due to vulnerability")
    |> halt
  end
end
