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
end
