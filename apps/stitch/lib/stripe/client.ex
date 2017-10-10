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
  @spec create_customer(integer, String.t) :: String.t
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
  @spec delete_customer(String.t) :: boolean
  def delete_customer(customer_id) do
    case Stripe.Customers.delete(customer_id) do
      {:ok, _} -> true
      _ -> false
    end
  end
end
