defmodule StitchConnect.Web.Api.V1.Billing.CardController do
  use StitchConnect.Web, :controller
  alias SitchConnect.Web.ErrorView
  alias Stitch.Billing

  def index(conn, _params) do
    team = conn.assigns.team
    cards = Billing.list_cards(team)
    render(conn, "index.json", cards: cards)
  end
end
