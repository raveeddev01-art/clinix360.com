defmodule Stitch.Billing do
  @moduledoc """
  Manage team billing and subscriptions.
  """

  import Ecto.Query
  alias Stitch.{Repo, Team}
  alias Stitch.Billing.{PaymentMethod, Subscription}

  @stripe_client Application.get_env(:stitch, :stripe_client)
  @trial_duration 14 * 24 * 60 * 60 # 14 days in seconds

  @doc """
  Configures a newly created team with a trial.
  """
  @spec setup_new_team(Team.t) :: Subscription.t
  def setup_new_team(%Team{id: team_id, name: team_name}) do
    customer_id = @stripe_client.create_customer(team_id, team_name)

    %{valid_until: trial_end_datetime(), team_id: team_id, customer_id: customer_id, tier: "TRIAL"}
    |> Subscription.new()
    |> Repo.insert()
    |> case do
      {:ok, subscription} -> {:ok, subscription}
      {:error, changeset} ->
        # If the insert fails for any reason, delete the created customer before exiting
        @stripe_client.delete_customer(customer_id)
        {:error, changeset}
    end
  end

  defp trial_end_datetime do
    DateTime.utc_now()
    |> DateTime.to_unix()
    |> Kernel.+(@trial_duration)
    |> DateTime.from_unix!()
  end

  @doc """
  Gets the subscription for a team.

  ## Example

      iex> get_subscription(%Team{...})
      %Subscription{...}

  """
  @spec get_subscription(Team.t) :: Subscription.t
  def get_subscription(%Team{} = team) do
    team = Repo.preload(team, :subscription)
    subscription = team.subscription

    active_user_count = active_user_count(team)
    estimated_invoice_amount = estimated_invoice_amount(subscription.tier, active_user_count)

    %Subscription{subscription | estimated_invoice_amount: estimated_invoice_amount}
  end

  defp active_user_count(%Team{} = team) do
    team
    |> Stitch.TeamQueries.list_active_users()
    |> length()
  end

  defp estimated_invoice_amount("TRIAL", _active_user_count), do: 0
  defp estimated_invoice_amount("BASIC", active_user_count), do: 5 * active_user_count
  defp estimated_invoice_amount("PREMIUM", active_user_count), do: 10 * active_user_count
  defp estimated_invoice_amount("POWER", active_user_count), do: 15 * active_user_count

  @doc """
  Modifies a subscription for a team.

  ## Upgrading From a Trial

  If a subscription is in a trial, the subscription will be upgraded to a paid subscription.
  A map with `:tier` and `:renewal_frequency` is expected.

      %{
        tier: "BASIC" | "PREMIUM" | "POWER",
        renewal_frequency: "MONTHLY" | "YEARLY"
      }

  ## Changing Tiers

  A subscription can change tiers. A map with `:tier` and `:renewal_frequency` is expected.

      %{
        tier: "BASIC" | "PREMIUM" | "POWER",
        renewal_frequency: "MONTHLY" | "YEARLY"
      }

  ## Examples

      iex> modify_subscription(%Subscription{...}, %{tier: "POWER", renewal_frequency: "MONTHLY"})
      {:ok, %Subscription{...}}

  """
  @spec modify_subscription(Subscription.t, map) :: {:ok, Subscription.t} | {:error, Ecto.Changeset.t}
  def modify_subscription(subscription, params \\ %{})
  def modify_subscription(%Subscription{tier: "TRIAL"} = subscription, params) do
    do_modify_subscription(subscription, params, &create_subscription/2)
  end
  def modify_subscription(%Subscription{} = subscription, params) do
    do_modify_subscription(subscription, params, &update_subscription/2)
  end

  defp do_modify_subscription(subscription, params, fun) when is_function(fun, 2) do
    with %Ecto.Changeset{valid?: true} = changeset <- Subscription.modify_by_user(params),
         plan_id = determine_plan_id(changeset.changes),
         {:ok, stripe_sub_params} <- fun.(subscription, plan_id) do
      subscription
      |> subscription_update_changeset(changeset.changes, stripe_sub_params)
      |> Repo.update()
    else
      %Ecto.Changeset{valid?: false} = changeset -> {:error, changeset}
    error -> error
    end
  end

  defp create_subscription(subscription, plan_id) do
    customer_id = subscription.customer_id
    subscription = Repo.preload(subscription, :team)
    user_count = active_user_count(subscription.team)
    @stripe_client.create_subscription(customer_id, plan_id, user_count)
  end

  defp update_subscription(subscription, plan_id) do
    customer_id = subscription.customer_id
    subscription_id = subscription.subscription_id
    @stripe_client.update_subscription(customer_id, subscription_id, plan_id)
  end

  @doc """
  Cancels a subscription and doesn't renew at the end of the billing period.

  ## Examples

      iex> cancel_subscription(%Subscription{...})
      {:ok, %Subscription{renews: false, ...}}

  """
  @spec cancel_subscription(Subscription.t) :: {:ok, Subscription.t} | {:error, Changeset.t | :expired | :trial}
  def cancel_subscription(%Subscription{tier: "TRIAL"}), do: {:error, :trial}
  def cancel_subscription(%Subscription{subscription_id: nil}), do: {:error, :expired}
  def cancel_subscription(%Subscription{customer_id: customer_id, subscription_id: subscription_id} = subscription) do
    with {:ok, stripe_sub_params} <- @stripe_client.cancel_subscription(customer_id, subscription_id) do
      subscription
      |> Subscription.update(stripe_sub_params)
      |> Repo.update()
    end
  end

  @doc """
  Renews a subscription.

  If a subscription is set to be cancelled at the end of the billing period, the subscription will be changed to renew.
  Otherwise, an expired/cancelled subscription cannot be reused and a new subscription will need to be created on Stripe.Accounts

  ## Examples

      iex> renew_subscription(%Subscription{...})
      {:ok, %Subscription{renews: true, ...}}

  """
  @spec renew_subscription(Subscription.t) :: {:ok, Subscription.t} | {:error, Changeset.t | :trial}
  def renew_subscription(%Subscription{tier: "TRIAL"}), do: {:error, :trial}
  def renew_subscription(%Subscription{subscription_id: nil} = subscription) do
    plan_id = determine_plan_id(subscription)
    with {:ok, stripe_sub_params} <- create_subscription(subscription, plan_id) do
      subscription
      |> Subscription.update(stripe_sub_params)
      |> Repo.update()
    end
  end
  def renew_subscription(%Subscription{customer_id: customer_id, subscription_id: subscription_id} = subscription) do
    with {:ok, stripe_sub_params} <- @stripe_client.renew_subscription(customer_id, subscription_id) do
      subscription
      |> Subscription.update(stripe_sub_params)
      |> Repo.update()
    end
  end

  defp determine_plan_id(%{tier: "BASIC", renewal_frequency: "MONTHLY"}),   do: "basic_monthly"
  defp determine_plan_id(%{tier: "BASIC", renewal_frequency: "YEARLY"}),    do: "basic_yearly"
  defp determine_plan_id(%{tier: "PREMIUM", renewal_frequency: "MONTHLY"}), do: "premium_monthly"
  defp determine_plan_id(%{tier: "PREMIUM", renewal_frequency: "YEARLY"}),  do: "premium_yearly"
  defp determine_plan_id(%{tier: "POWER", renewal_frequency: "MONTHLY"}),   do: "power_monthly"
  defp determine_plan_id(%{tier: "POWER", renewal_frequency: "YEARLY"}),    do: "power_yearly"

  @spec subscription_update_changeset(Subscription.t, map, map) :: Ecto.Changeset.t
  defp subscription_update_changeset(%Subscription{} = subscription, user_changes, stripe_changes) do
    update_params = Map.merge(user_changes, stripe_changes)
    Subscription.update(subscription, update_params)
  end

  @doc false
  def update_subscription(customer_id, subscription_id, params) do
    if subscription = Repo.get_by(Subscription, customer_id: customer_id, subscription_id: subscription_id) do
      subscription
      |> Subscription.update(params)
      |> Repo.update()
    end
  end

  @doc """
  Lists all the saved cards for a Team.

  ## Example

      iex> list_cards(%Team{...})
      [%PaymentMethod{...}, ...]
  """
  @spec list_cards(Team.t) :: [PaymentMethod.t]
  def list_cards(%Team{id: team_id}) do
    query =
      from pm in PaymentMethod,
      where: pm.team_id == ^team_id,
      order_by: [asc: pm.inserted_at]

    Repo.all(query)
  end

  @doc """
  Adds a credit card to the team.

  If the card is the first card to be added, the card will be set as the default card.

  ## Example

      iex> add_card(%Team{...}, "tok_1234567")
      {:ok, %PaymentMethod{...}}

  """
  @spec add_card(Team.t, String.t) :: {:ok, PaymentMethod.t} | {:error, Ecto.Changeset.t | :invalid_token}
  def add_card(%Team{id: team_id} = team, source_token) do
    team = Repo.preload(team, :subscription)
    customer_id = team.subscription.customer_id

    with %{valid?: true} = changeset <- PaymentMethod.stripe(%{source_token: source_token}),
         {:ok, card} <- @stripe_client.add_card(customer_id, changeset.changes.source_token) do
      do_insert_card(team_id, card)
    else
      %Ecto.Changeset{} = changeset -> {:error, changeset}
      :error -> {:error, :invalid_token}
    end
  end

  defp do_insert_card(team_id, card_params) do
    query =
      from pm in PaymentMethod,
      where: pm.team_id == ^team_id,
      select: count(pm.id)
    set_as_default? = Repo.one(query) == 0

    params =
      card_params
      |> Map.put(:default, set_as_default?)
      |> Map.put(:team_id, team_id)

    params
    |> PaymentMethod.new()
    |> Repo.insert()
  end

  @doc """
  Removes a card from a Team.

  Cards that are the default payment method cannot be deleted.

  ## Examples

      iex> delete_card(%Team{...}, 123)
      :ok

  """
  @spec delete_card(Team.t, pos_integer) :: :ok | {:error, :not_found | :default_card}
  def delete_card(%Team{id: team_id} = team, payment_method_id) do
    team = Repo.preload(team, :subscription)
    query =
      from pm in PaymentMethod,
      where: pm.team_id == ^team_id,
      where: pm.id == ^payment_method_id

    with payment_method when not is_nil(payment_method) <- Repo.one(query),
         {:default?, false} <- {:default?, payment_method.default},
         true <- @stripe_client.remove_card(team.subscription.customer_id, payment_method.card_id) do
      {:ok, _} = Repo.delete(payment_method)
      :ok
    else
      nil -> {:error, :not_found}
      {:default?, true} -> {:error, :default_card}
      false -> {:error, :not_found}
    end
  end

  @doc """
  Sets the payment method as the default payment method.

  ## Examples

      iex> set_as_default(%Team{...}, 5) do
      {:ok, %PaymentMethod{id: 5, ..., default: true}}

  """
  @spec set_as_default(Team.t, pos_integer) :: {:ok, PaymentMethod.t} | {:error, :not_found}
  def set_as_default(%Team{id: team_id} = team, payment_method_id) do
    team = Repo.preload(team, :subscription)

    with payment_method when not is_nil(payment_method) <- Repo.get_by(PaymentMethod, id: payment_method_id, team_id: team_id),
         @stripe_client.set_as_default_card(team.subscription.customer_id, payment_method.card_id),
         {:ok, %{new_default: payment_method}} <- do_set_as_default(payment_method, team_id) do
      {:ok, payment_method}
    else
      nil -> {:error, :not_found}
      false -> {:error, :not_found}
    end
  end

  defp do_set_as_default(payment_method, team_id) do
    clear_previous_default_query =
      from pm in PaymentMethod,
      where: pm.team_id == ^team_id,
      where: pm.id != ^payment_method.id,
      update: [set: [default: false]]

    Ecto.Multi.new()
    |> Ecto.Multi.update(:new_default, Ecto.Changeset.change(payment_method, default: true))
    |> Ecto.Multi.update_all(:clear_old_default, clear_previous_default_query, [])
    |> Repo.transaction()
  end
end
