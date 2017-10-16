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

  def remove_card(_customer_id, _card_id), do: true

  def set_as_default_card(_customer_id, _card_id), do: true

  def create_subscription(_, _, _) do
    sub = %{
      subscription_id: "sub_#{timestamp()}",
      valid_until: DateTime.from_unix!(Kernel.+(timestamp(), 2_000_000)),
      status: "active"
    }

    {:ok, sub}
  end

  defp timestamp do
    DateTime.to_unix(DateTime.utc_now())
  end
end
