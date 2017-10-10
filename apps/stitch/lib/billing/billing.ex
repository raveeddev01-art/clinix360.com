defmodule Stitch.Billing do
  @moduledoc """
  Manage team billing and subscriptions.
  """

  alias Stitch.{Repo, Team}
  alias Stitch.Billing.Subscription

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
end
