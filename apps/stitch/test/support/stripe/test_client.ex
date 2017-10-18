defmodule Stitch.Stripe.TestClient do
  @moduledoc """
  Mock Stripe client meant for testing purposes.
  """

  @behaviour Stitch.Stripe

  @impl Stitch.Stripe
  def create_customer(_team_id, _team_name) do
    "cus_#{timestamp()}"
  end

  @impl Stitch.Stripe
  def delete_customer(_customer_id), do: true

  @impl Stitch.Stripe
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

  @impl Stitch.Stripe
  def remove_card(_customer_id, _card_id), do: true

  @impl Stitch.Stripe
  def set_as_default_card(_customer_id, _card_id), do: true

  @impl Stitch.Stripe
  def create_subscription(_customer_id, _subscription_id, _user_count) do
    sub = %{
      subscription_id: "sub_#{timestamp()}",
      valid_until: future_time(),
      status: "active",
      renews: true
    }

    {:ok, sub}
  end

  @impl Stitch.Stripe
  def update_subscription(_customer_id, subscription_id, _plan_id) do
    sub = %{
      subscription_id: subscription_id,
      valid_until: future_time(),
      status: "active",
      renews: true
    }
    {:ok, sub}
  end

  @impl Stitch.Stripe
  def cancel_subscription(_customer_id, subscription_id) do
    sub = %{
      subscription_id: subscription_id,
      valid_until: future_time(),
      status: "active",
      renews: false
    }
    {:ok, sub}
  end

  @impl Stitch.Stripe
  def renew_subscription(_customer_id, subscription_id) do
    sub = %{
      subscription_id: subscription_id,
      valid_until: future_time(),
      status: "active",
      renews: true
    }
    {:ok, sub}
  end

  @impl Stitch.Stripe
  def get_event(_), do: %{}

  defp future_time, do: DateTime.from_unix!(Kernel.+(timestamp(), 2_000_000))

  defp timestamp do
    DateTime.to_unix(DateTime.utc_now())
  end
end
