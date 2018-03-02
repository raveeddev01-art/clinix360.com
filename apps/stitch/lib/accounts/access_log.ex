defmodule Stitch.Accounts.AccessLog do
  @moduledoc """
  The AccessLog schema module.
  """
  use Ecto.Schema
  import Ecto.Query
  import Ecto.Changeset
  alias Stitch.Accounts.{User, AccessLog}
  alias Stitch.{Repo, Team}
  require Logger

  @type t :: %__MODULE__{}

  schema "access_logs" do
    belongs_to(:user, User)
    field(:user_agent, :string)
    field(:ip_address, :string)
    field(:app_version, :string)

    field(:last_access_at, :naive_datetime)
    field(:access_count, :integer)
    field(:inserted_at_date, :naive_datetime)

    timestamps(updated_at: false)
  end

  @spec new(AccessLog.t(), map | nil) :: Changeset.t()
  def new(%AccessLog{} = struct, attrs \\ %{}) do
    naive_datetime = NaiveDateTime.utc_now()

    struct
    |> cast(attrs, [:user_agent, :ip_address, :app_version])
    |> validate_required([:user_agent, :ip_address])
    |> put_change(:last_access_at, naive_datetime)
    |> put_change(:inserted_at_date, naive_date(naive_datetime))
  end

  @spec create_or_update(User.t(), binary, binary, binary | nil) ::
          {:ok, AccessLog.t()} | {:error, Changeset.t()}
  def create_or_update(%User{} = user, ip_address, user_agent, app_version \\ "undefined") do
    Logger.info("[access-log] #{user.id} - #{user.email}: #{ip_address} #{user_agent} #{app_version}")
    %AccessLog{user_id: user.id}
    |> new(%{ip_address: ip_address, user_agent: user_agent, app_version: app_version})
    |> Repo.insert(
      conflict_target: [:user_id, :user_agent, :ip_address, :app_version, :inserted_at_date],
      on_conflict: [inc: [access_count: 1], set: [last_access_at: NaiveDateTime.utc_now()]]
    )
  end

  @spec async_create_or_update(User.t(), binary, binary, binary | nil) :: {:ok, pid}
  def async_create_or_update(%User{} = user, ip_address, user_agent, app_version \\ nil) do
    Stitch.Task.start(fn ->
      create_or_update(user, ip_address, user_agent, app_version)
    end)
  end

  @spec list(Team.t(), list | nil) :: Stitch.Paginator.t()
  def list(%Team{} = team, opts \\ []) do
    limit = opts[:limit] || 200
    offset = opts[:skip] || 0

    query =
      AccessLog
      |> join(:inner, [a], u in assoc(a, :user))
      |> where([a, u], u.team_id == ^team.id)
      |> order_by([a, u], desc: a.last_access_at)

    Stitch.Paginator.new(query, skip: offset, limit: limit)
  end

  defp naive_date(%NaiveDateTime{} = naive_datetime) do
    %{naive_datetime | hour: 0, minute: 0, second: 0, microsecond: {0, 0}}
  end
end