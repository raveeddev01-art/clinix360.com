defmodule Stitch.AnalyticsMessageCount do
  use Ecto.Schema
  import Ecto.Changeset

  alias Stitch.{
    AnalyticsMessageCount,
    Repo
  }

  @type t :: %__MODULE__{}

  @attributes [
    :count,
    :date
  ]

  schema "analytics_message_counts" do
    field(:count, :integer)
    field(:date, :naive_datetime)
    timestamps(updated_at: false, inserted_at: false)
  end

  def new(attrs \\ %{}) do
    %AnalyticsMessageCount{}
    |> cast(attrs, @attributes)
    |> put_change(:count, 0)
  end

  def create(message) do
    new(%{date: naive_date(message.inserted_at)})
    |> Repo.insert(
      conflict_target: [:date],
      on_conflict: [
        inc: [count: 1]
      ]
    )
  end

  defp naive_date(%NaiveDateTime{} = naive_datetime) do
    %{naive_datetime | hour: 0, minute: 0, second: 0, microsecond: {0, 0}}
  end
end
