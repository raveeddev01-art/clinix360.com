defmodule StitchConnect.Plug.EnsureUnlocked do
  import Plug.Conn

  def init(default), do: default

  def call(conn, _) do
    if get_session(conn, :locked) do
      conn
      |> put_status(:unauthorized)
      |> Phoenix.Controller.json(nil)
      |> halt
    else
      conn
    end
  end
end
