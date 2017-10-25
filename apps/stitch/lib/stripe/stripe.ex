defmodule Stitch.Stripe do
  @moduledoc """
  Defines an interface for expected interactions with Stripe.
  """

  @doc """
  Creates a new customer.
  """
  @callback create_customer(team_id :: integer, team_name :: String.t) :: customer_id :: String.t

  @doc """
  Deletes a customer.
  """
  @callback delete_customer(customer_id :: String.t) :: boolean
 end
