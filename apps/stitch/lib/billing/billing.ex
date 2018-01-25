defmodule Stitch.Billing do
  @moduledoc """
  Manage team billing and subscriptions.
  """

  import Ecto.Query
  alias Stitch.{Repo, Team, TeamQueries, FeatureGateway}
  alias Stitch.Billing.{Plan, Subscription, PaymentMethod}

  @stripe_client Application.get_env(:stitch, :stripe_client)
  @trial_duration 14 * 24 * 60 * 60 # 14 days in seconds
  @analytics Application.get_env(:stitch, :analytics)
  @billable_roles ["admin", "member", "multi-room-guest"]

  @doc """
  Configures a newly created team with a trial.
  """
  @spec setup_new_team(Team.t) :: Subscription.t
  def setup_new_team(%Team{id: team_id, name: team_name}) do
    customer_id = @stripe_client.create_customer(team_id, team_name)
    end_time = trial_end_datetime()

    params = %{
      valid_until: end_time,
      trial_valid_until: end_time,
      team_id: team_id,
      customer_id: customer_id,
      tier: "TRIAL"
    }

    params
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

      iex> get_subscription("cus_1234567", "sub_1234567")
      %Subscription{...}

      iex> get_subscription("bad_id", "bad_id")
      nil

  """
  @spec get_subscription(Team.t) :: Subscription.t
  def get_subscription(%Team{} = team) do
    team = Repo.preload(team, :subscription)
    team.subscription
  end

  @spec get_subscription(String.t, String.t) :: Subscription.t | nil
  def get_subscription(customer_id, subscription_id) do
    Repo.get_by(Subscription, customer_id: customer_id, subscription_id: subscription_id)
  end

  @doc false
  def list_billable_users(%Team{id: team_id}) do
    query =
      from u in Stitch.Accounts.User,
      where: u.onboarded == true,
      where: u.disabled == false,
      where: u.team_id == ^team_id,
      where: fragment("? && ?", ^@billable_roles, u.roles)
    Repo.all(query)
  end

  defp count_billable_users(%Team{} = team) do
    team
    |> list_billable_users()
    |> length()
  end

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
  @spec modify_subscription(Subscription.t, map) :: {:ok, Subscription.t} | {:error, Ecto.Changeset.t | :card_required}
  def modify_subscription(subscription, params \\ %{})
  def modify_subscription(%Subscription{tier: "TRIAL"} = subscription, params) do
    do_modify_subscription(subscription, params, &create_subscription/2)
  end
  def modify_subscription(%Subscription{} = subscription, params) do
    do_modify_subscription(subscription, params, &update_subscription/2)
  end

  defp do_modify_subscription(subscription, params, fun) when is_function(fun, 2) do
    with %Ecto.Changeset{valid?: true} = changeset <- Subscription.modify_by_user(params),
         {:count, count} when count > 0 <- {:count, card_count(subscription.team_id)},
         plan_id = Plan.id(changeset.changes),
         {:ok, stripe_sub_params} <- fun.(subscription, plan_id) do
      result =
        subscription
        |> subscription_update_changeset(changeset.changes, stripe_sub_params)
        |> Repo.update()

      case result do
        {:ok, subscription} ->
          modify_guests_subscription(subscription)
          analytics_identify_and_group(subscription.team_id)
        _ ->
          :ignore
      end

      result
    else
      %Ecto.Changeset{valid?: false} = changeset -> {:error, changeset}
      {:count, _} -> {:error, :card_required}
      error -> error
    end
  end

  defp analytics_identify_and_group(team_id) do
    Task.start(fn ->
      @analytics.identify_and_group(%{team_id: team_id})
    end)
  end

  defp create_subscription(subscription, plan_id) do
    customer_id = subscription.customer_id
    subscription = Repo.preload(subscription, :team)
    user_count = count_billable_users(subscription.team)
    opts = subscription_opts(subscription)

    @stripe_client.create_subscription(customer_id, plan_id, user_count, opts)
  end

  defp update_subscription(subscription, plan_id) do
    customer_id = subscription.customer_id
    subscription_id = subscription.subscription_id
    opts = subscription_opts(subscription)

    @stripe_client.update_subscription_plan(customer_id, subscription_id, plan_id, opts)
  end

  defp subscription_opts(subscription) do
    case DateTime.compare(subscription.trial_valid_until, DateTime.utc_now()) do
      :gt -> [trial_end_date: subscription.trial_valid_until]
      _ -> []
    end
  end

  defp modify_guests_subscription(subscription) do
    with subscription = Repo.preload(subscription, :team),
         {:error, _} <- FeatureGateway.allowed?(:guests, subscription),
         {count, users} when is_number(count) and is_list(users) <- TeamQueries.deactivate_all_guests(subscription.team) do
      :ok
    else
      any -> any
    end
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
    plan_id = Plan.id(subscription)
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

  @spec subscription_update_changeset(Subscription.t, map, map) :: Ecto.Changeset.t
  defp subscription_update_changeset(%Subscription{} = subscription, user_changes, stripe_changes) do
    update_params = Map.merge(user_changes, stripe_changes)
    update_params =
      if update_params.estimated_invoice_amount == nil do
        Map.delete(update_params, :estimated_invoice_amount)
      else
        update_params
      end
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

  defp card_count(team_id) do
    query =
      from pm in PaymentMethod,
      where: pm.team_id == ^team_id,
      select: count(pm.id)
    Repo.one(query)
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

  New cards are set as the default card.

  ## Example

      iex> add_card(%Team{...}, "tok_1234567")
      {:ok, %PaymentMethod{default: true, ...}}

  """
  @spec add_card(Team.t, String.t) :: {:ok, PaymentMethod.t} | {:error, Ecto.Changeset.t | :invalid_token}
  def add_card(%Team{id: team_id} = team, source_token) do
    team = Repo.preload(team, :subscription)
    customer_id = team.subscription.customer_id

    with %{valid?: true} = changeset <- PaymentMethod.stripe(%{source_token: source_token}),
         {:ok, card} <- @stripe_client.add_card(customer_id, changeset.changes.source_token),
         :true <- @stripe_client.set_as_default_card(customer_id, card.card_id),
         {:ok, payment_method} <- do_insert_card(team_id, card) do
      do_set_as_default(payment_method)
      {:ok, payment_method}
    else
      %Ecto.Changeset{} = changeset -> {:error, changeset}
      :error -> {:error, :invalid_token}
    end
  end

  defp do_insert_card(team_id, card_params) do
    params =
      card_params
      |> Map.put(:default, true)
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

      iex> set_card_as_default(%Team{...}, 5) do
      {:ok, %PaymentMethod{id: 5, ..., default: true}}

  """
  @spec set_card_as_default(Team.t, pos_integer) :: {:ok, PaymentMethod.t} | {:error, :not_found}
  def set_card_as_default(%Team{id: team_id} = team, payment_method_id) do
    team = Repo.preload(team, :subscription)

    with payment_method when not is_nil(payment_method) <- Repo.get_by(PaymentMethod, id: payment_method_id, team_id: team_id),
         true <- @stripe_client.set_as_default_card(team.subscription.customer_id, payment_method.card_id) do
      {:ok, do_set_as_default(payment_method)}
    else
      nil -> {:error, :not_found}
      false -> {:error, :not_found}
    end
  end

  defp do_set_as_default(%PaymentMethod{id: id, team_id: team_id}) do
    query =
      from pm in PaymentMethod,
      where: pm.team_id == ^team_id,
      update: [
        set: [default: fragment("CASE WHEN id = ? THEN true ELSE false END", ^id)]
      ]
    {_update_count, updates} = Repo.update_all(query, [], returning: true)
    Enum.find(updates, &(&1.id == id))
  end

  @doc """
  Updates the current active user count for the team.

  ## Examples

      iex> update_subscriber_count(%Team{...})
      :ok

  """
  @spec update_subscriber_count(Team.t) :: :ok | :error | false
  def update_subscriber_count(%Team{} = team) do
    team = Repo.preload(team, :subscription)
    subscription = team.subscription

    with subscription_line_item_id when not is_nil(subscription_line_item_id) <- team.subscription.subscription_line_item_id,
         billable_user_count = count_billable_users(team),
         {:ok, stripe_sub_params} <- @stripe_client.update_subscription_quantity(subscription.customer_id, subscription.subscription_id, subscription_line_item_id, billable_user_count),
         {:ok, _} <- Repo.update(subscription_update_changeset(subscription, %{}, stripe_sub_params)) do
      :ok
    else
      :error -> :error
      nil -> false
    end
  end
end
