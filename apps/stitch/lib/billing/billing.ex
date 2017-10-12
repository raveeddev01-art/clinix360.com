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

    %{valid_until: trial_end_datetime(), team_id: team_id, customer_id: customer_id}
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
