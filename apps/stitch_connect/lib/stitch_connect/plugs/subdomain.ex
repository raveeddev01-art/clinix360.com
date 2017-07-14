defmodule StitchConnect.Plug.Subdomain do
  import Plug.Conn

  def init(default), do: default

  def call(conn, router) do
    case get_subdomain(conn.host) do
      subdomain when byte_size(subdomain) > 0 ->
        case Stitch.TeamQueries.get_by_slug(subdomain) do
          nil ->
            conn
            |> Phoenix.Controller.redirect(external: root_url(conn))
            |> halt
          team ->
            conn
            |> put_private(:subdomain, subdomain)
            |> put_private(:team_slug, team.slug)
            |> put_private(:team_name, team.name)
            |> put_private(:team_id, team.id)
            |> router.call(router.init({}))
            |> halt
        end
      _ -> conn
    end
  end

  defp root_url(conn) do
    host = conn.host
      |> String.split(".")
      |> Enum.at(1)

    if conn.port do
      "#{conn.scheme}://#{host}:#{conn.port}"
    else
      "#{conn.scheme}://#{host}"
    end
  end

  defp get_subdomain(host) do
    root_host = StitchConnect.Web.Endpoint.config(:url)[:host]
    String.replace(host, ~r/.?#{root_host}/, "")
  end
end