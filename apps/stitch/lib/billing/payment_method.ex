defmodule Stitch.Billing.PaymentMethod do
  @moduledoc """
  Represents a saved credit card.
  """
  use Ecto.Schema
  import Ecto.Changeset

  schema "payment_methods" do
    field :card_id, :string
    field :brand, :string
    field :last_four, :string
    field :exp_month, :integer
    field :exp_year, :integer
    field :cardholder_name, :string
    field :default, :boolean, default: false

    belongs_to :team, Stitch.Team

    field :source_token, :string, virtual: true

    timestamps()
  end

  @doc false
  def stripe(params \\ %{}) do
    %__MODULE__{}
    |> cast(params, [:source_token])
    |> validate_required([:source_token])
  end

  @doc false
  def new(params \\ %{}) do
    fields = ~w(card_id brand last_four exp_month exp_year cardholder_name default team_id)a

    %__MODULE__{}
    |> cast(params, fields)
    |> validate_required(fields)
  end
end
