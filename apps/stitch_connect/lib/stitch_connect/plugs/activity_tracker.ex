defmodule StitchConnect.Plug.ActivityTracker do
  @moduledoc """
  A plug for tracking activity. Any HTTP request that goes through
  this plug updates activity status for the currently authenticated user.

  The plug should be included after one of the authenticating plugs as
  it requires `current_user` to be present in `assigns`.
  """

  alias Stitch.Accounts.ActivityTracker
  require Logger

  def init(default), do: default

  def call(conn, _opts) do
    current_user = conn.assigns.current_user
    ActivityTracker.async_update_activity(current_user)
    conn
  end
end
