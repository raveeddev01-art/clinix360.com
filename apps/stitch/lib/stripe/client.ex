defmodule Stitch.Stripe.Client do
  @moduledoc """
  Stripe client interfaces with Stripe servers.
  """
  @behaviour Stitch.Stripe

  @doc """
  Creates a new Stripe customer.

  ## Example

      iex> create_customer(123, "Team Stitch")
      "cus_1234567"

  """
  @impl Stitch.Stripe
  def create_customer(team_id, team_name) do
    customer_opts = [
      metadata: [
        team_id: team_id,
        team_name: team_name
      ]
    ]
    {:ok, %{id: customer_id}} = Stripe.Customers.create(customer_opts)
    customer_id
  end

  @doc """
  Deletes a Stripe customer.

  ## Example

      iex> delete_customer("cus_1234567")
      true

  """
  @impl Stitch.Stripe
  def delete_customer(customer_id) do
    case Stripe.Customers.delete(customer_id) do
      {:ok, _} -> true
      _ -> false
    end
  end

  @doc """
  Adds a credit card to a customer.

  ## Example

      iex> add_card("cus_1234567", "tok_2134567")
      %{card_id: "card_1234567", brand: "Visa", exp_month: 8, exp_year: 2020, last_four: "4242"}

  """
  @impl Stitch.Stripe
  def add_card(customer_id, source_token) do
    case Stripe.Cards.create(:customer, customer_id, source: source_token) do
      {:ok, card} -> {:ok, transform_card(card)}
      _ -> :error
    end
  end

  defp transform_card(%{id: card_id, brand: brand, last4: last_four, exp_month: exp_month, exp_year: exp_year}) do
    %{
      card_id: card_id,
      brand: brand,
      last_four: last_four,
      exp_month: exp_month,
      exp_year: exp_year
    }
  end

  @doc """
  Removes a card from a customer.

  ## Examples

      iex> remove_card("cus_1234567", "card_1234567")
      true

      iex> remove_card("cus_1234567", "bad_id")
      false

  """
  @impl Stitch.Stripe
  def remove_card(customer_id, card_id) do
    case Stripe.Cards.delete(:customer, customer_id, card_id) do
      {:ok, %{delete: true}} -> true
      _ -> false
    end
  end

  @doc """
  Sets a card as the default card for the customer.

  ## Examples

      iex> set_as_default_card("cus_1234567", "card_1234567")
      true

  """
  @impl Stitch.Stripe
  def set_as_default_card(customer_id, card_id) do
    case Stripe.Customers.update(customer_id, default_source: card_id) do
      {:ok, _} -> true
      _ -> false
    end
  end

  @doc """
  Creates a new subscription for a customer.

  ## Examples

      iex> create_subscription("cus_1234567", "basic_monthly", 5)
      {:ok, %{subscription_id: "sub_1234567", status: "active", valid_until: %DateTime{...}, renews: true}}

  """
  @impl Stitch.Stripe
  def create_subscription(customer_id, plan_id, user_count) do
    case Stripe.Subscriptions.create(customer_id, plan: plan_id, quantity: user_count) do
      {:ok, sub} -> {:ok, transform_subscription(sub)}
      _ -> :error
    end
  end

  defp transform_subscription(subscription) do
    %{
      subscription_id: subscription.id,
      status: subscription.status,
      valid_until: DateTime.from_unix!(subscription.current_period_ends),
      renews: !subscription.cancel_at_period_end
    }
  end

  @doc """
  Updates an existing subscription to a different tier.

  ## Examples

      iex> update_subscription("cus_1234567", "sub_1234567", "power_monthly")
      {:ok, %{subscription_id: "sub_1234567", status: "active", valid_until: %DateTime{...}, renews: true}}

  """
  @impl Stitch.Stripe
  def update_subscription(customer_id, subscription_id, plan_id) do
    case Stripe.Subscriptions.change(customer_id, subscription_id, plan_id) do
      {:ok, sub} -> {:ok, transform_subscription(sub)}
      _ -> :error
    end
  end

  @doc """
  Cancels a valid/paid subscription to not rewew at the end of the billing cycle.

  ## Examples

      iex> cancel_subscription("cus_1234567", "sub_1234567")
      {:ok, %{subscription_id: "sub_1234567", status: "active", valid_until: %DateTime{...}, renews: false}}

  """
  @impl Stitch.Stripe
  def cancel_subscription(customer_id, subscription_id) do
    case Stripe.Subscriptions.cancel(customer_id, subscription_id, at_period_end: true) do
      {:ok, sub} -> {:ok, transform_subscription(sub)}
      _ -> :error
    end
  end
end
