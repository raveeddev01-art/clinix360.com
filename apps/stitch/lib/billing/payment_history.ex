defmodule Stitch.Billing.PaymentHistory do
  @moduledoc """
  Represents a saved credit card.
  """
  use Ecto.Schema
  import Ecto.Changeset

  schema "payment_history" do
    field :invoice_id, :string
    belongs_to :team, Stitch.Team
    field :plan, :string
    field :amount, :decimal
    field :quantity, :integer
    field :period_start, :naive_datetime
    field :period_end, :naive_datetime

    timestamps(updated_at: false) # History cannot be updated
  end

  @doc false
  def changeset(%__MODULE__{} = struct, params \\ %{}) do
    fields = ~w(invoice_id team_id plan amount quantity period_start period_end)a

    struct
    |> cast(params, fields)
    |> validate_required(fields)
    |> unique_constraint(:invoice_id)
  end
end
