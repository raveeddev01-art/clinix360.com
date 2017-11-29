defmodule Stitch.Billing.Subscription do
  @moduledoc """
  Represents a subscription belonging to a Team.
  """
  use Ecto.Schema
  import Ecto.Changeset

  schema "subscriptions" do
    field :valid_until, :utc_datetime
    field :trial_valid_until, :utc_datetime
    field :tier, :string
    field :customer_id, :string                 # Stripe customer id
    field :subscription_id, :string             # Stripe subscription id
    field :subscription_line_item_id, :string   # Stripe subscription line item with plan and quantity
    field :renewal_frequency, :string
    field :renews, :boolean, default: false
    field :estimated_invoice_amount, :integer

    belongs_to :team, Stitch.Team

    timestamps()
  end

  @doc false
  def new(params \\ %{}) do
    %__MODULE__{}
    |> cast(params, ~w(valid_until trial_valid_until tier team_id customer_id)a)
    |> validate_required(~w(valid_until trial_valid_until tier team_id customer_id)a)
    |> unique_constraint(:team_id)
  end

  @doc false
  def modify_by_user(params \\ %{}) do
    %__MODULE__{}
    |> cast(params, ~w(tier renewal_frequency renews)a)
    |> validate_required(~w(tier renewal_frequency)a)
    |> validate_inclusion(:tier, ~w(BASIC PREMIUM POWER), message: "expects BASIC|PREMIUM|POWER")
    |> validate_inclusion(:renewal_frequency, ~w(MONTHLY YEARLY), message: "expects MONTHLY|YEARLY")
  end

  @doc false
  def update(struct, params \\ %{}) do
    cast(struct, params, ~w(tier renewal_frequency subscription_id subscription_line_item_id valid_until trial_valid_until renews estimated_invoice_amount)a)
  end
end
