defmodule Stitch.Stripe.Migrator do
  alias Stitch.{Team, Billing, Billing.Plan, Billing.Subscription}
  alias Stitch.Stripe.Migrator.Helper
  import Ecto.{Query, Changeset}
  alias Stitch.Repo
  require Logger

  @event_list_limit 100
  # Correct for production
  @last_event_id "evt_1BsY3RCjAbiXzvjlDNMHismS"

  @doc """
  These are the customers migrated from Stripe V2 to V1 and were signed up on V2. We
  Asked stripe to copy their customers from V2 to V1 but subscription cannot be copoied
  between stripe accounts. These customers have already purchased subscription on V2
  and we just want to add their subscription on V1 without invoicing them again. There
  was only one way to create a subscription on V1 without invoicing them + setting their
  next billing cycle according to their original purchase to set trial_period = valid_until.
  Stripe generate first invoice on the end of trial_period, and till then no invoice is
  generated, this is exactly what we needed. We have to update subscription_id,
  subscription_line_item_id in our database for newly created subscription as well as we
  have to update stripe with the billable user count and subscription plan.
  """
  def link_v2_customers() do
    query =
      from(
        s in Subscription,
        join: t in Team,
        on: t.id == s.team_id,
        where: not is_nil(s.subscription_id),
        where: s.tier != "TRIAL",
        preload: [team: t]
      )

    query
    |> Repo.all()
    |> Enum.map(fn %Subscription{customer_id: customer_id, subscription_id: subscription_id} =
                     subscription ->
      case Stripe.Subscriptions.get(customer_id, subscription_id) do
        {:error, _} ->
          user_count =
            subscription.team
            |> Billing.list_billable_users()
            |> length()

          request_opts = [
            quantity: user_count,
            plan: Plan.id(subscription),
            trial_end: DateTime.to_unix(subscription.valid_until)
          ]

          {:ok, stripe_sub} = Stripe.Subscriptions.create(customer_id, request_opts)
          item = List.first(stripe_sub[:items]["data"])
          subscription_line_item_id = item["id"]
          subscription_id = stripe_sub[:id]

          subscription
          |> change(subscription_id: subscription_id)
          |> change(subscription_line_item_id: subscription_line_item_id)
          |> Repo.update()

        {:ok, stripe_sub} ->
          stripe_sub
      end
    end)
  end

  @doc """
  These are the customers migrated from stitch V1 to stitch V2 but their link for stripe
  billing were not migrated/maintained. It was a manual effort and I grabbed this by
  working manually with @bharat. Here is the master document for reference.
  https://paper.dropbox.com/doc/Stitch-Stripe-Migrations-3lY4DUgcFfQoxHgc83qiK
  We just linked the migrated customers to their old stripe customer_ids, subscription_ids
  , and valid_until based on the stitch V1 database. Also we are setting their tier +
  renewal_frequency based on the document shared by @bharat.
  """
  def link_v1_customers(), do: Helper.execute_sql_file("link_stripe_customers.sql")

  @doc """
  For Stitch V1 we were using many custom pricing plans, we reduced them to have 6
  main pricing plans and we are trying to map old plans to new ones. Some customers
  still need a custom pricing and we will leave them as is without touching their
  subscriptions. Along-with plan correction, we are updating billable user count to
  strip V1 also because Stripe V1 was disconnected from production and do not have
  updated data. In short we are syncing subscriptions between Stripe V1 and our database.
  """
  def link_subscriptions() do
    query =
      from(
        s in Subscription,
        join: t in Team,
        on: t.id == s.team_id,
        where: not is_nil(s.subscription_id),
        preload: [team: t]
      )

    query
    |> Repo.all()
    |> Enum.map(fn %Subscription{customer_id: customer_id, subscription_id: subscription_id} =
                     subscription ->
      # Fetch subscription details from Stripe
      {:ok, stripe_sub} = Stripe.Subscriptions.get(customer_id, subscription_id)
      renews = !stripe_sub[:cancel_at_period_end]
      item = List.first(stripe_sub[:items]["data"])
      subscription_line_item_id = item["id"]

      # Map to the V2 plan id
      old_plans = [
        "Free",
        "Basic",
        "Premium",
        "Basic-Monthly",
        "Basic-Yearly",
        "Premium-Monthly",
        "Premium-Yearly",
        "Power-Monthly",
        "Power-Yearly"
      ]

      new_plan =
        if item["plan"]["id"] in old_plans do
          case item["plan"]["id"] do
            "Free" -> "basic_monthly"
            "Basic" -> "basic_monthly"
            "Basic-Monthly" -> "basic_monthly"
            "Basic-Yearly" -> "basic_yearly"
            "Premium" -> "premium_monthly"
            "Premium-Monthly" -> "premium_monthly"
            "Premium-Yearly" -> "premium_yearly"
            "Power-Monthly" -> "power_monthly"
            "Power-Yearly" -> "power_yearly"
          end
        else
          item["plan"]["id"]
        end

      # Update Billable user count
      user_count =
        subscription.team
        |> Billing.list_billable_users()
        |> length()

      request_opts = [
        prorate: true,
        items: [
          "0": [
            id: subscription_line_item_id,
            quantity: user_count,
            plan: new_plan
          ]
        ]
      ]

      Stripe.Subscriptions.change(customer_id, subscription_id, new_plan)

      # Update renews, valid_until, upcoming_invoice, subscription_line_item_id
      {:ok, upcoming_invoice} =
        Stripe.Invoices.upcoming(customer_id, subscription: subscription_id)

      valid_until = DateTime.from_unix!(upcoming_invoice[:period_end])

      subscription
      |> change(renews: renews)
      |> change(valid_until: valid_until)
      |> change(subscription_line_item_id: subscription_line_item_id)
      |> change(estimated_invoice_amount: upcoming_invoice.amount_due)
      |> Repo.update()

      if stripe_sub[:cancel_at_period_end] do
        Stripe.Subscriptions.cancel(customer_id, subscription_id, at_period_end: true)
      end
    end)
  end

  @doc """
  There is no way of getting customer's credit card info. We just grabbed from Stitch V1
  database, parsed and created an SQL file to import into Stitch V2 database.
  """
  def import_payment_methods(), do: Helper.execute_sql_file("import_payment_methods.sql")

  @doc """
  Payment history is a new thing, we have to generate statement pdf + insert a record into
  payment_histories table for every paid invoice. Currently it is being generated when
  stripe trigger `invoic.payment_succeeded` event. I just grabbed all events recursively,
  filtered them up based on the event type, and recorded the history one by one. This is
  very low priority thing and we are getting this on the very last of billing process.
  """
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

    if Mix.env == :prod do
      last_event_id = List.last(events)["id"]
      {:ok, %{data: events}} = Stripe.Events.list(last_event_id, @event_list_limit)
      do_import_payment_history(teams, events)
    end
  end

  @doc """
  Stripe do have around ~1400 customers while our database do have only ~250. We planned
  to cleanup stripe dashboard by removing dead subscriptions + customers. We are pulling
  list of active customers from database, list of all customers from stripe, one by one
  we are canceling subscriptions and removing customers which are not present in our
  datababase.
  """
  def remove_dead_stripe_customers() do
    # Make easy useable map from fetched customers
    teams =
      Subscription
      |> Repo.all()
      |> Enum.reduce(%{}, fn x, acc ->
        Map.put(acc, String.to_atom(x.customer_id), x)
      end)

    # Fetch all customers from stripe
    {:ok, customers} = Stripe.Customers.all()
    customers = if Mix.env == :prod, do: customers, else: [List.first(customers)]

    # Loop over each stripe customer and for customers missing in db do
    Enum.map(customers, fn c ->
      if !teams[String.to_atom(c["id"])] do
        # cancel all suscriptions + remove customers froms stripe
        Logger.info("Removing Stripe Customer #{c["id"]}")
        Stripe.Subscriptions.cancel_all(c["id"], [])
        Stripe.Customers.delete(c["id"])
      end
    end)
  end

  @doc """
  When we will link stitch from stripe v2 to stripe v1 back again, all the new signups on
  stitch v2 which are not having subscriptions yet will need to be recreated on stripe V1.
  """
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

    query
    |> Repo.all()
    |> Enum.map(fn subscription ->
      case Stripe.Customers.get(subscription.customer_id) do
        {:error, _} ->
          team = subscription.team
          customer_id = Stitch.Stripe.Client.create_customer(team.id, team.name)

          subscription
          |> Ecto.Changeset.change(customer_id: customer_id)
          |> Repo.update()

        {:ok, stripe_cust} ->
          stripe_cust
      end
    end)
  end

  @doc """
  This is to run the all migrations in decided sequence in one go.s
  We can get it executed by
  $ iex -S mix phx.server
  iex> Code.load_file("apps/stitch/priv/repo/stripe_migration/migrator.ex")
  iex> Stitch.Stripe.Migrator.run()
  """
  def run() do
    link_v2_customers()
    link_v1_customers()
    link_subscriptions()
    import_payment_methods()
    remove_dead_stripe_customers()
    create_missing_stripe_customers()
    # This will take time and is least priority thing
    import_payment_history()
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
