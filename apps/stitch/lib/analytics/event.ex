defmodule Stitch.Analytics.Event do
  @moduledoc """
  Represents an event.

  """
  use Ecto.Schema
  import Ecto.Changeset

  schema "segment_events" do
    field :payload, :map
    timestamps()
  end

  @doc false
  def new(params \\ %{}) do
    fields = ~w(payload)a

    %__MODULE__{}
    |> cast(params, fields)
    |> validate_required(fields)
  end
end
