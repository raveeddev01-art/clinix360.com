defmodule StitchConnect.Plug.PlugAttack do
  import Plug.Conn
  use PlugAttack

  # rule "deny china", conn do
  #   ip_address = conn.remote_ip |> Tuple.to_list |> Enum.join(".")
  #   allow IP2Country.whereis(ip_address) not in [:CN]
  # end
end