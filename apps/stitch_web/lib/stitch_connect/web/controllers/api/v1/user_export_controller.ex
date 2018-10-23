defmodule StitchConnect.Web.Api.V1.UserExportController do
  use Stitch.Web, :controller
  alias Stitch.{Exports, Accounts.User}

  def index(conn, _params) do
    team = conn.assigns.team
    exports = Exports.list_user_exports(team)
    render(conn, "index.json", exports: exports)
  end

  def create(conn, %{"user_id" => user_id}) do
    team = conn.assigns.team
    current_user = conn.assigns.current_user
    Exports.clean_outdated_user_exports(team, current_user)

    with {:user, %User{} = target_user} <- {:user, Stitch.UserQueries.get_by_id(user_id)},
         {:authorized, true} <-
           {:authorized, Exports.authorized_to_create_user_export?(current_user, target_user)},
         {:export, {:ok, user_export}} = {:export, Exports.create_user_export(team, target_user)} do
      Exports.schedule_export(team, user_export)
      user_export = %{user_export | user: target_user}
      render(conn, "show.json", export: user_export)
    else
      _error ->
        conn
        |> put_status(:too_many_requests)
        |> render("429.json")
    end
  end
end
