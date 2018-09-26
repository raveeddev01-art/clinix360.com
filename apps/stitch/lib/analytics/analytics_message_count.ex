defmodule Stitch.AnalyticsMessageCount do
  use Ecto.Schema
  import Ecto.Changeset

  alias Stitch.{
    AnalyticsMessageCount,
    Repo,
    Team
  }

  @type t :: %__MODULE__{}

  @attributes [
    :count,
    :date,
    :team_id
  ]

  schema "analytics_message_counts" do
    field(:count, :integer)
    field(:date, :naive_datetime)
    belongs_to(:team, Team)
    timestamps(updated_at: false, inserted_at: false)
  end

  def new(attrs \\ %{}) do
    %AnalyticsMessageCount{}
    |> cast(attrs, @attributes)
  end

  def create(message) do
    message = Repo.preload(message, :user)

    new(%{date: naive_date(message.inserted_at), count: 1, team_id: message.user.team_id})
    |> Repo.insert(
      conflict_target: [:date, :team_id],
      on_conflict: [
        inc: [count: 1]
      ]
    )
  end

  defp naive_date(%NaiveDateTime{} = naive_datetime) do
    %{naive_datetime | hour: 0, minute: 0, second: 0, microsecond: {0, 0}}
  end
end
