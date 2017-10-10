defmodule Stitch.Stripe.TestClient do
  @moduledoc """
  Mock Stripe client meant for testing purposes.
  """

  @behaviour Stitch.Stripe

  def create_customer(_team_id, _team_name) do
    "cus_#{timestamp()}"
  end

  def delete_customer(_customer_id), do: true

  def add_card(_customer_id, "tok_valid") do
    card = %{
      card_id: "card_#{timestamp()}",
      brand: "Visa",
      exp_month: Enum.random(1..12),
      exp_year: Enum.random(2018..2025),
      last_four: "4242"
    }

    {:ok, card}
  end
  def add_card(_customer_id, "tok_invalid"), do: :error

  def remove_card(_customer_id, "card_valid"), do: true
  def remove_card(_customer_id, "card_invalid"), do: false

  defp timestamp do
    DateTime.to_unix(DateTime.utc_now())
  end
end
