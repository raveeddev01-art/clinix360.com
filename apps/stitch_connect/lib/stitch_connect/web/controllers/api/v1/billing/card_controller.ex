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

  def update(conn, %{"id" => card_id, "default" => true}) do
    team = conn.assigns.team
    with {:ok, card} <- Billing.set_card_as_default(team, card_id) do
      render(conn, "show.json", card: card)
    end
  end
  def update(conn, _) do
    errors = %{"default" => ["must be set to `true`"]}
    conn
    |> put_status(:unprocessable_entity)
    |> render(ErrorView, :"422", errors: errors)
  end

  def delete(conn, %{"id" => card_id}) do
    team = conn.assigns.team

    with :ok <- Billing.delete_card(team, card_id) do
      conn
      |> put_status(:no_content)
      |> json(%{})
    else
      {:error, :default_card} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(ErrorView, :"422", errors: "Cannot delete the default card.")
      error -> error
    end
  end
end
