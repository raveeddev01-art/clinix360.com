defmodule Stitch.Billing.Subscription do
  @moduledoc """
  Represents a subscription belonging to a Team.
  """
  use Ecto.Schema
  import Ecto.Changeset
  alias Stitch.Billing.Subscription

  @paid_tiers ["STANDARD", "PREMIUM"]

  schema "subscriptions" do
    field(:valid_until, :utc_datetime)
    field(:tier, :string)
    # Stripe customer id
    field(:customer_id, :string)
    # Stripe subscription id
    field(:subscription_id, :string)
    # Stripe subscription line item with plan and quantity
    field(:subscription_line_item_id, :string)
    field(:renewal_frequency, :string)
    field(:renews, :boolean, default: false)
    field(:estimated_invoice_amount, :integer)

    belongs_to(:team, Stitch.Team)

    timestamps()
  end

  @doc false
  def new(params \\ %{}) do
    %__MODULE__{}
    |> cast(params, ~w(valid_until tier team_id customer_id)a)
    |> validate_required(~w(tier team_id customer_id)a)
    |> unique_constraint(:team_id)
  end

  @doc false
  def modify_by_user(params \\ %{}) do
    %__MODULE__{}
    |> cast(params, ~w(tier renewal_frequency renews)a)
    |> validate_required(~w(tier)a)
    |> validate_inclusion(
      :tier,
      ~w(FREE STANDARD PREMIUM),
      message: "expects FREE|STANDARD|PREMIUM"
    )
    |> validate_inclusion(
      :renewal_frequency,
      ["MONTHLY", "YEARLY", nil],
      message: "expects MONTHLY|YEARLY"
    )
  end

  @doc false
  def update(struct, params \\ %{}) do
    cast(
      struct,
      params,
      ~w(tier renewal_frequency subscription_id subscription_line_item_id valid_until renews estimated_invoice_amount)a
    )
  end

  def paid_tier(%Subscription{tier: tier}) do
    tier in @paid_tiers
  end
end
