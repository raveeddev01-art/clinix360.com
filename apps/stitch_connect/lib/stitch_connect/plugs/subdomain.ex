defmodule StitchConnect.Plug.Subdomain do
  import Plug.Conn
  alias StitchConnect.Web.Endpoint

  def init(default), do: default

  def call(conn, router) do
    case get_subdomain(conn.host) do
      subdomain when byte_size(subdomain) > 0 ->
        case Stitch.TeamQueries.get_by_slug(subdomain) do
          nil ->
            conn
            |> Phoenix.Controller.redirect(external: Endpoint.url)
            |> halt
          team ->
            conn
            |> put_private(:subdomain, subdomain)
            |> put_private(:team_slug, team.slug)
            |> put_private(:team_name, team.name)
            |> put_private(:team_id, team.id)
            |> assign(:team, team)
            |> router.call(router.init({}))
            |> halt
        end
      _ -> conn
    end
  end

  defp get_subdomain(host) do
    String.replace(host, ~r/.?#{Endpoint.host}/, "")
  end
end
