defmodule Stitch.Stripe do
  @moduledoc """
  Defines an interface for expected interactions with Stripe.
  """

  @type card :: %{card_id: String.t, brand: String.t, last_four: String.t, exp_month: 1..12, exp_year: pos_integer}
  @type subscription :: %{subscription_id: String.t, subscription_line_item_id: String.t, valid_until: DateTime.t, status: String.t, renews: boolean}

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

  @doc """
  Sets the card as the default card for the customer.
  """
  @callback set_as_default_card(customer_id :: String.t, card_id :: String.t) :: boolean

  @doc """
  Creates a new subscription for a customer.
  """
  @callback create_subscription(customer_id :: String.t, plan_id :: String.t, user_count :: pos_integer) :: {:ok, subscription} | :error

  @doc """
  Updates an existing subscription for a customer to a different plan.
  """
  @callback update_subscription_plan(customer_id :: String.t, subscription_id :: String.t, plan_id :: String.t) :: {:ok, subscription} | :error

  @doc """
  Updates the subscription's quantity.
  """
  @callback update_subscription_quantity(subscription_line_item_id :: String.t, user_count :: pos_integer) :: :ok | :error

  @doc """
  Cancels a subscription to no longer renew at the end of a billing cycle.
  """
  @callback cancel_subscription(customer_id :: String.t, subscription_id :: String.t) :: {:ok, subscription} | :error

  @doc """
  Sets a valid subscription to renew at the end of the billing cycle.
  """
  @callback renew_subscription(customer_id :: String.t, subscription_id :: String.t) :: {:ok, subscription} | :error

  @doc """
  Gets an event from Stripe.
  """
  @callback get_event(event_id :: String.t) :: {:ok, %{}} | :error
end
