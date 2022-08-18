defmodule Stitch.Repo.Scripts.OldBillingHistory do
  require Logger
  import Ecto.{Query, Changeset}
  alias Stitch.{Repo, Team, Billing}
  alias Billing.{Subscription, PaymentHistory}

  # Code.load_file(".../Work/stitch/stitch-phoenix/apps/stitch/priv/repo/scripts/old_billing_history.exs")
  # Stitch.Repo.Scripts.OldBillingHistory.run()

  @options %{
    limit: 100,
    type: "invoice.payment_succeeded"
  }

  def import_payment_history() do
    query =
      from(
        s in Subscription,
        join: t in Team,
        on: t.id == s.team_id,
        preload: [team: t]
      )

    # Make easy useable map from fetched customers
    teams =
      query
      |> Repo.all()
      |> Enum.reduce(%{}, fn x, acc ->
        Map.put(acc, x.customer_id, x.team)
      end)

    process_next_batch(@options, teams)
  end

  defp process_next_batch(options, teams) do
    Logger.info("==== Fetching next payment history batch...")

    case Stripe.Event.list(options) do
      {:ok, %{data: events}} -> do_import_payment_history(teams, events)
      any -> any
    end
  end

  defp do_import_payment_history(_, []), do: nil

  defp do_import_payment_history(teams, events) do
    Logger.info("==== Processing next payment history batch...")

    # Loop over every event and run the following
    Enum.map(events, fn %{data: %{object: object}} ->
      if team = teams[object.customer] do
        exists = Repo.one(PaymentHistory |> where(invoice_id: ^object.id))

        if exists do
          Logger.info("==== Skipping because already saved invoice #{object.id}")
        else
          Logger.info("==== Recording payment history for team #{team.id} invoice #{object.id}")

          team
          |> Stitch.Stripe.Events.record_payment_history(object)
          |> change(%{inserted_at: DateTime.from_unix!(object.date)})
          |> Repo.update!()
        end
      else
        Logger.info("==== Skipping because customer do not exists: #{object.customer}")
      end
    end)

    options = Map.put(@options, :starting_after, List.last(events).id)
    process_next_batch(options, teams)
  end

  def run() do
    import_payment_history()
  end
end
