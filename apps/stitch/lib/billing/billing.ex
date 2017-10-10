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

  @doc """
  Adds a credict card to the team.

  If the card is the first card to be added, the card will be set as the default card.

  ## Example

      iex> add_card(%Team{...}, "tok_1234567")
      {:ok, %PaymentMethod{...}}

  """
  @spec add_card(Team.t, String.t) :: {:ok, PaymentMethod.t} | :error
  def add_card(%Team{id: team_id} = team, source_token) do
    team = Repo.preload(team, :subscription)
    case @stripe_client.add_card(team.subscription.customer_id, source_token) do
      {:ok, card} -> do_insert_card(team_id, card)
      _ -> :error
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

  defp trial_end_datetime do
    DateTime.utc_now()
    |> DateTime.to_unix()
    |> Kernel.+(@trial_duration)
    |> DateTime.from_unix!()
  end
end
