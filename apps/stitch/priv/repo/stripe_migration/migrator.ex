defmodule Stitch.Stripe.Migrator do
  alias Stitch.{Team, Billing.Subscription}
  alias Stitch.Stripe.Migrator.Helper
  alias Stitch.Repo
  import Ecto.Query
  require Logger

  @event_list_limit 100
  # Correct for production
  @last_event_id "evt_1BsY3RCjAbiXzvjlDNMHismS"

  def link_customers(), do: Helper.execute_sql_file("link_stripe_customers.sql")

  def import_payment_methods(), do: Helper.execute_sql_file("import_payment_methods.sql")

  def import_payment_history() do
    # Fetch all events with `type: "invoice.payment_succeeded"`
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
        Map.put(acc, String.to_atom(x.customer_id), x.team)
      end)

    {:ok, %{data: events}} = Stripe.Events.list(@last_event_id, @event_list_limit)
    do_import_payment_history(teams, events)
  end

  defp do_import_payment_history(_, []), do: nil

  defp do_import_payment_history(teams, events) do
    # Loop over every event and run the following
    Enum.map(events, fn event ->
      if event["type"] == "invoice.payment_succeeded" do
        event = for {key, val} <- event, into: %{}, do: {String.to_atom(key), val}
        customer_id = get_in(event, [:data, "object", "customer"])

        if team = teams[String.to_atom(customer_id)] do
          Stitch.Stripe.Events.record_payment_history(team, event)
        end
      end
    end)

    last_event_id = List.last(events)["id"]
    {:ok, %{data: events}} = Stripe.Events.list(last_event_id, @event_list_limit)
    do_import_payment_history(teams, events)
  end

  def remove_dead_stripe_customers() do
    # Fetch all customsers from database
    query = from(s in Subscription, where: not is_nil(s.subscription_id))

    # Make easy useable map from fetched customers
    keep =
      query
      |> Repo.all()
      |> Enum.reduce(%{}, fn x, acc ->
        Map.put(acc, String.to_atom(x.customer_id), x)
      end)

    # Fetch all customers from stripe
    {:ok, customers} = Stripe.Customers.all()

    # Remove for production
    customers = [List.first(customers)]

    # Loop over each stripe customer and for customers missing in db do
    Enum.map(customers, fn c ->
      if !keep[String.to_atom(c["id"])] do
        # cancel all suscriptions + remove customers froms stripe
        Logger.info("Removing Stripe Customer #{c["id"]}")
        Logger.info(Stripe.Subscriptions.cancel_all(c["id"], []))
        Logger.info(Stripe.Customers.delete(c["id"]))
      end
    end)
  end

  def create_missing_stripe_customers() do
    # Fetch all customsers from database
    query =
      from(
        s in Subscription,
        join: t in Team,
        on: t.id == s.team_id,
        where: is_nil(s.subscription_id),
        preload: [team: t]
      )

    # Make easy useable map from fetched customers
    query
    |> Repo.all()
    |> Enum.map(fn subscription ->
      team = subscription.team
      customer_id = Stitch.Stripe.Client.create_customer(team.id, team.name)

      subscription
      |> Ecto.Changeset.change(customer_id: customer_id)
      |> Repo.update()
    end)
  end

  def migrate_v2_customers_to_v1() do
    IO.puts("Do migrate V2 Customers to V1 Manually")
  end

  def run() do
    link_customers()
    import_payment_methods()
    import_payment_history()
    remove_dead_stripe_customers()
    create_missing_stripe_customers()
    migrate_v2_customers_to_v1()
  end
end

defmodule Stitch.Stripe.Migrator.Helper do
  require Logger
  alias Stitch.Repo

  def read_file(filepath) do
    Logger.info("Reading file: #{__DIR__}/#{filepath}")

    case File.read("#{__DIR__}/#{filepath}") do
      {:error, error} ->
        Logger.error("Error reading file #{filepath}")
        raise error

      {:ok, file} ->
        file
    end
  end

  def execute_sql_file(filepath) do
    filepath
    |> read_file()
    |> execute_sql()
  end

  def execute_sql(content) do
    content
    |> String.split(";")
    |> Enum.map(fn x ->
      query = String.trim(x)
      Ecto.Adapters.SQL.query!(Repo, query, [])
    end)
  end
end
