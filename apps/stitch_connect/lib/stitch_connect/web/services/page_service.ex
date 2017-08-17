defmodule StitchConnect.Web.PageService do
  def app_params(conn) do
    conn |> app_params_map |> Poison.encode!
  end

  def app_params_map(conn) do
    %{
      "teamName" => conn.private[:team_name],
      "teamId" => conn.private[:team_id],
      "subdomain" => conn.private[:subdomain]
    }
  end
end
