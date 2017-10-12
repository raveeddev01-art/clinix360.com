defmodule StitchConnect.Web.Api.V1.Billing.CardController do
  use StitchConnect.Web, :controller
  alias StitchConnect.Web.ErrorView
  alias Stitch.Billing

  action_fallback StitchConnect.Web.Api.FallbackController

  def index(conn, _params) do
    team = conn.assigns.team
    cards = Billing.list_cards(team)
    render(conn, "index.json", cards: cards)
  end

  def create(conn, params) do
    team = conn.assigns.team
    with {:ok, card} <- Billing.add_card(team, params["source_token"]) do
      conn
      |> put_status(:created)
      |> render("show.json", card: card)
    else
      {:error, :invalid_token} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(ErrorView, :"422", errors: %{"source_token" => ["is invalid"]})
      error -> error
    end
  end
end
