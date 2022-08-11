defmodule Stitch.Call do
  @moduledoc """
  The Call schema module.
  """

  use Ecto.Schema
  import Ecto.Query
  import Ecto.Changeset

  alias Stitch.{
    Repo,
    Tokbox,
    Message,
    Accounts.User,
    Util.Security
  }

  schema "calls" do
    field(:hash, :string)
    field(:session_id, :string)
    field(:started_at, :integer)
    field(:ended_at, :integer)
    field(:active_now, {:array, :integer}, default: [])
    field(:attendees, {:array, :integer}, default: [])
    field(:status, :string, default: "ringing")

    belongs_to(:caller, User)
    has_many(:messages, Message, on_delete: :delete_all)

    timestamps()
  end

  @required_attributes [:hash, :session_id, :caller_id, :status]
  @optional_attributes [:started_at, :ended_at, :active_now, :attendees]

  def changeset(%__MODULE__{} = struct, params) do
    struct
    |> cast(params, @required_attributes ++ @optional_attributes)
    |> validate_required(@required_attributes)
    |> validate_inclusion(:status, ["ringing", "missed", "talking", "ended", "declined"])
  end

  def new(%User{id: user_id}) do
    with {:ok, session_id} = Tokbox.Client.session_create() do
      %__MODULE__{}
      |> changeset(%{
        hash: Security.websafe_string(),
        session_id: session_id,
        caller_id: user_id
      })
      |> Repo.insert()
    end
  end

  def get_by_hash(hash) do
    __MODULE__ |> where(hash: ^hash) |> Repo.one()
  end

  def get_by_session(session_id) do
    __MODULE__ |> where(session_id: ^session_id) |> Repo.one()
  end
end
