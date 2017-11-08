defmodule StitchConnect.Web.Api.V1.Billing.CardView do
  use StitchConnect.Web, :view

  def render("index.json", %{cards: cards}) do
    data = for card <- cards, do: card(card)
    %{data: data}
  end

  def render("show.json", %{card: card}) do
    %{data: card(card)}
  end

  defp card(card) do
    %{
      id: card.id,
      brand: card.brand,
      last_four: card.last_four,
      exp_month: card.exp_month,
      exp_year: card.exp_year,
      cardholder_name: card.cardholder_name
      default: card.default,
      inserted_at: card.inserted_at,
      updated_at: card.updated_at
    }
  end
end
