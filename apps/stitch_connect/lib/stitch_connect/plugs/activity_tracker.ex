defmodule Stitch.Plug.ActivityTracker do
  @moduledoc """
  A plug for tracking activity. Any HTTP request that goes through
  this plug updates activity status for the currently authenticated user.

  The plug should be included after one of the authenticating plugs as
  it requires `current_user` to be present in `assigns`.
  """

  import Plug.Conn
  alias Stitch.Accounts.ActivityTracker

  def init(default), do: default

  def call(conn, _opts) do
    current_user = conn.assigns.current_user
    # Update activity only for mobile apps (that don't use HTTP session) and
    # skip the activity update for request coming from the web/electron apps.
    # (Web/electron apps send "became_active" via WebSocket as a single source of truth of user activity).
    unless get_session(conn, :current_user_token) do
      ActivityTracker.async_update_activity(current_user)
    end

    conn
  end
end
