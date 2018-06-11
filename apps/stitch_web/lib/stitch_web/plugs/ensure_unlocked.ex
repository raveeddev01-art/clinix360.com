defmodule Stitch.Web.Plug.EnsureUnlocked do
  use Stitch.Web, :plug

  def init(default), do: default

  def call(conn, _) do
    if get_user_session_lock_status(conn) do
      conn
      |> put_status(:unauthorized)
      |> Phoenix.Controller.json(nil)
      |> halt
    else
      conn
    end
  end
end
