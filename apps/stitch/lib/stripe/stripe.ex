defmodule Stitch.Stripe do
  @moduledoc """
  Defines an interface for expected interactions with Stripe.
  """
  @type card :: %{card_id: String.t, brand: String.t, last_four: String.t, exp_month: 1..12, exp_year: pos_integer}

  @doc """
  Creates a new customer.
  """
  @callback create_customer(team_id :: integer, team_name :: String.t) :: customer_id :: String.t

  @doc """
  Deletes a customer.
  """
  @callback delete_customer(customer_id :: String.t) :: boolean

  @doc """
  Adds a new credit card to a customer.
  """
  @callback add_card(customer_id :: String.t, source_token :: String.t) :: {:ok, card} | :error

  @doc """
  Removes a card from a customer.
  """
  @callback remove_card(customer_id :: String.t, card_id :: String.t) :: boolean
 end
