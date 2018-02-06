defmodule Stitch.Stripe.Migrator do
  alias Stitch.{Team, Billing, Billing.Plan, Billing.Subscription}
  alias Stitch.Stripe.Migrator.Helper
  import Ecto.{Query, Changeset}
  alias Stitch.Repo
  require Logger

  @event_list_limit 100
  # Correct for production
  @last_event_id "evt_1BsY3RCjAbiXzvjlDNMHismS"

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
        {:error, error} ->
          user_count =
            subscription.team
            |> Billing.list_billable_users()
            |> length()

          request_opts = [
            plan: Plan.id(subscription),
            quantity: user_count,
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

  def link_v1_customers(), do: Helper.execute_sql_file("link_stripe_customers.sql")

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

    # Uncomment for production
    # last_event_id = List.last(events)["id"]
    # {:ok, %{data: events}} = Stripe.Events.list(last_event_id, @event_list_limit)
    # do_import_payment_history(teams, events)
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

    query
    |> Repo.all()
    |> Enum.map(fn subscription ->
      case Stripe.Customers.get(subscription.customer_id) do
        {:error, error} ->
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

  def run() do
    link_v2_customers()
    link_v1_customers()
    link_subscriptions()
    import_payment_methods()
    import_payment_history()
    remove_dead_stripe_customers()
    create_missing_stripe_customers()
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
