defmodule StitchConnect.Web.PageService do
  def app_params(conn) do
    Poison.encode!(%{
      "teamName" => conn.private[:team_name],
      "teamId" => conn.private[:team_id],
      "subdomain" => conn.private[:subdomain]
    })
  end
end