defmodule Stitch.Billing.Subscription do
  @moduledoc """
  Represents a subscription belonging to a Team.
  """
  use Ecto.Schema
  import Ecto.Changeset

  schema "subscriptions" do
    field :valid_until, :utc_datetime
    field :tier, :string, default: "TRIAL"
    field :customer_id, :string
    field :subscription_id, :string
    field :renewal_frequency, :string
    field :renews, :boolean, default: false

    belongs_to :team, Stitch.Team

    timestamps()
  end

  @doc false
  def new(params \\ %{}) do
    %__MODULE__{}
    |> cast(params, ~w(valid_until team_id customer_id)a)
    |> validate_required(~w(valid_until team_id customer_id)a)
    |> unique_constraint(:team_id)
  end
end
