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
      %{card_id: "card_1234567", brand: "Visa", exp_month: 8, exp_year: 2020, last_four: "4242", cardholder_name: "John Doe"}

  """
  @impl Stitch.Stripe
  def add_card(customer_id, source_token) do
    case Stripe.Cards.create(:customer, customer_id, source: source_token) do
      {:ok, card} -> {:ok, transform_card(card)}
      _ -> :error
    end
  end

  defp transform_card(%{id: card_id, brand: brand, last4: last_four, exp_month: exp_month, exp_year: exp_year, name: cardholder_name}) do
    %{
      card_id: card_id,
      brand: brand,
      last_four: last_four,
      exp_month: exp_month,
      exp_year: exp_year,
      cardholder_name: cardholder_name
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
      {:ok, %{deleted: true}} -> true
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

  ## Options

  * `:trial_end_date` - DateTime of when trial period should end.

  ## Examples

      iex> create_subscription("cus_1234567", "basic_monthly", 5)
      {:ok, %{subscription_id: "sub_1234567", subscription_line_item_id: "si_1234567", status: "active", valid_until: %DateTime{...}, renews: true}}

      iex> create_subscription("cus_1234567", "basic_monthly", 5, trial_end_date: %DateTime{...})
      {:ok, %{subscription_id: "sub_1234567", subscription_line_item_id: "si_1234567", status: "trialing", valid_until: %DateTime{...}, renews: true}}

  """
  @impl Stitch.Stripe
  def create_subscription(customer_id, plan_id, user_count, opts \\ []) do
    default_opts = [plan: plan_id, quantity: user_count]
    subscription_opts =
      case opts[:trial_end_date] do
        %DateTime{} = date ->
          unix_timestamp = DateTime.to_unix(date)
          Keyword.put(default_opts, :trial_end, unix_timestamp)
        _ -> default_opts
      end

    with {:ok, sub} <- Stripe.Subscriptions.create(customer_id, subscription_opts),
         {:ok, upcoming_invoice} <- Stripe.Invoices.upcoming(customer_id, [subscription: sub.id]) do
      {:ok, transform_subscription(sub, upcoming_invoice)}
    else
      _ -> :error
    end
  end

  defp transform_subscription(subscription) do
    %{items: %{"data" => [%{"id" => subscription_line_item_id}]}} = subscription
    %{
      subscription_id: subscription.id,
      subscription_line_item_id: subscription_line_item_id,
      estimated_invoice_amount: nil,
      status: subscription.status,
      valid_until: DateTime.from_unix!(subscription.current_period_end),
      renews: !subscription.cancel_at_period_end
    }
  end
  defp transform_subscription(subscription, upcoming_invoice) do
    subscription
    |> transform_subscription()
    |> Map.put(:estimated_invoice_amount, upcoming_invoice.amount_due)
  end

  @doc """
  Updates an existing subscription to a different plan.

  ## Options

  * `:trial_end_date` - DateTime of when trial period should end.

  ## Examples

      iex> update_subscription_plan("cus_1234567", "sub_1234567", "power_monthly")
      {:ok, %{subscription_id: "sub_1234567", subscription_line_item_id: "si_1234567", status: "active", valid_until: %DateTime{...}, renews: true}}

      iex> update_subscription_plan("cus_1234567", "sub_1234567", "power_monthly", trial_end_date: %DateTime{...})
      {:ok, %{subscription_id: "sub_1234567", subscription_line_item_id: "si_1234567", status: "trialing", valid_until: %DateTime{...}, renews: true}}

  """
  @impl Stitch.Stripe
  def update_subscription_plan(customer_id, subscription_id, plan_id, opts \\ []) do
    default_opts = [plan: plan_id]
    subscription_opts =
      case opts[:trial_end_date] do
        %DateTime{} = date ->
          unix_timestamp = DateTime.to_unix(date)
          Keyword.put(default_opts, :trial_end, unix_timestamp)
        _ -> default_opts
      end

    with {:ok, sub} <- Stripe.Subscriptions.change(customer_id, subscription_id, subscription_opts),
         {:ok, upcoming_invoice} <- Stripe.Invoices.upcoming(customer_id, [subscription: sub.id]) do
      {:ok, transform_subscription(sub, upcoming_invoice)}
    else
      _ -> :error
    end
  end

  @doc """
  Updates a subscription's quantity for its plan.

  Updating the subscription quantity requires the subscription item's id instead of the subscription id.
  Refer to https://stripe.com/docs/api#update_subscription_item for information.

  ## Examples

      iex> update_subscription_quantity("cus_1234567", "sub_1234567", "si_1234567", 5)
      :ok

  """
  @impl Stitch.Stripe
  def update_subscription_quantity(customer_id, subscription_id, subscription_line_item_id, user_count) do
    request_opts = [
      prorate: true,
      items: [
        "0": [
          id: subscription_line_item_id,
          quantity: user_count
        ]
      ]
    ]

    with {:ok, sub} <- Stripe.Subscriptions.change(customer_id, subscription_id, request_opts),
         {:ok, upcoming_invoice} <- Stripe.Invoices.upcoming(customer_id, [subscription: sub.id]) do
      {:ok, transform_subscription(sub, upcoming_invoice)}
    else
      _ -> :error
    end
  end

  @doc """
  Cancels a valid/paid subscription to not rewew at the end of the billing cycle.

  ## Examples

      iex> cancel_subscription("cus_1234567", "sub_1234567")
      {:ok, %{subscription_id: "sub_1234567", subscriptiion_line_item_id: "si_1234567", status: "active", valid_until: %DateTime{...}, renews: false}}

  """
  @impl Stitch.Stripe
  def cancel_subscription(customer_id, subscription_id) do
    case Stripe.Subscriptions.cancel(customer_id, subscription_id, at_period_end: true) do
      {:ok, sub} -> {:ok, transform_subscription(sub)}
      _ -> :error
    end
  end

  @doc """
  Sets a subscription to renew only if the subscription is set to cancel at the period end and
  if it is still active.

  ## Examples

      iex> renew_subscription("cus_1234567", "sub_1234567")
      {:ok, %{subscription_id: "sub_1234567", subscription_line_item_id: "si_1234567", status: "active", valid_until: %DateTime{...}, renews: true}}

  """
  @impl Stitch.Stripe
  def renew_subscription(customer_id, subscription_id) do
    case Stripe.Subscriptions.change(customer_id, subscription_id, [], Stripe.config_or_env_key()) do
      {:ok, sub} -> {:ok, transform_subscription(sub)}
      _ -> :error
    end
  end

  @doc """
  Gets an event from Stripe.

  ## Examples

      iex> get_event("evt_1234567")
      {:ok, %{...}}

  """
  @impl Stitch.Stripe
  def get_event(event_id) do
    case Stripe.Events.get(event_id) do
      {:ok, event} -> {:ok, event}
      _ -> :error
    end
  end
end
