defmodule StitchConnect.Web.Admin.ImpersonationController do
  use StitchConnect.Web, :controller
  alias StitchConnect.Web.Endpoint
  alias StitchConnect.Web.SubdomainRouter.Helpers, as: Routes
  alias Stitch.{TeamQueries, UserQueries}

  def impersonate(conn, %{"user_id" => id}) do
    staff_user = conn.assigns.current_user

    with {user_id, _} <- Integer.parse(id),
         %Stitch.Accounts.User{} = user <- UserQueries.get_active_by_id(user_id) do
      team = TeamQueries.get_by_id(user.team_id)

      uri = subdomain_uri(team.slug)

      conn
      |> login_user(user)
      |> put_session(:impersonator_user_token, staff_user.token)
      |> redirect(external: Routes.page_url(uri, :index))
    else
      nil ->
        html(conn, "User does not exist.")
      _ ->
        html(conn, "Invalid user id provided.")
    end
  end

  defp subdomain_uri(subdomain) do
    %URI{host: host} = base_uri = Endpoint.struct_url()
    %URI{base_uri | host: "#{subdomain}.#{host}"}
  end

  def stop(conn, _) do
    conn =
      if staff_user_token = get_session(conn, :impersonator_user_token) do
        staff_user = UserQueries.get_by_token(staff_user_token)

        conn
        |> login_user(staff_user)
        |> delete_session(:impersonator_user_token)
      else
        conn
      end

    uri = subdomain_uri("admin")
    redirect(conn, external: Routes.admin_index_url(uri, :index))
  end
end
