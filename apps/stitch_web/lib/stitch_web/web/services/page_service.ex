defmodule Stitch.Web.PageService do
  def app_params(conn) do
    conn |> app_params_map |> Poison.encode!()
  end

  def app_params_map(conn) do
    %{
      "teamName" => conn.private[:team_name],
      "teamId" => conn.private[:team_id],
      "subdomain" => conn.private[:subdomain],
      "teams" => get_logins(conn)
    }
  end

  def subdomain_url_struct(subdomain) do
    struct_url = Stitch.Web.Endpoint.struct_url()
    %{struct_url | host: "#{subdomain}.#{struct_url.host}"}
  end

  def get_logins(conn) do
    login_map = Plug.Conn.get_session(conn, :login_map) || %{}

    login_map
    |> Map.keys()
    |> Stitch.TeamQueries.get_by_ids()
    |> Enum.map(fn team ->
      %{id: team.id, name: team.name, slug: team.slug}
    end)
  end

  def get_logins_json(conn) do
    Poison.encode!(%{teams: get_logins(conn)})
  end
end
