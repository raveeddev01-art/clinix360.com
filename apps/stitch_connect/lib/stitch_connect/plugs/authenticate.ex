defmodule StitchConnect.Plug.Authenticate do
  import Plug.Conn
  alias Stitch.Accounts

  def init(default), do: default

  @refactor """
  unwrap nested case and conditionals
  consider private functions to pipe to to break down branching logic
  """
  def call(conn, _) do
    case get_session(conn, :current_user_id) do
      nil ->
        conn
        |> Phoenix.Controller.redirect(to: "/login")
        |> halt
      current_user_id ->
        case Accounts.get_by_id(current_user_id) do
          nil ->
            conn
            |> clear_session
            |> Phoenix.Controller.redirect(to: "/login")
            |> halt
          %{disabled: false} = current_user ->
            if current_user.team_id == conn.assigns.team.id do
              conn
              |> assign(:current_user, current_user)
            else
              conn
              |> Phoenix.Controller.redirect(to: "/login")
              |> halt
            end
          %{disabled: true} ->
            unless conn.request_path == "/login" or conn.request_path == "/submit_login" do
              conn
              |> Phoenix.Controller.redirect(to: "/logged-out")
              |> halt
            end
        end
    end
  end
end
