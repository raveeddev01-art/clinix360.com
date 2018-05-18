defmodule Stitch.Version do
  @moduledoc """
  Tracks record changes.

  - commited_by: user that commited the action (insert / update / delete)
  - source: "application", "migration", "rails admin", etc
  - action_type: "insert", "update", "delete"
  - record_type: the name of the module without the namespace e.g. "Accounts.User", "Message"
  - record_id: the id othe record
  - record: the serialized Ecto struct (w/o __meta__, __struct__, associations)
  - meta: any custom meta data that can be useful for audit.
  """

  alias Stitch.{Version, Repo, Accounts.User}

  use Ecto.Schema
  import Ecto.Changeset

  @type t :: %__MODULE__{}

  schema "versions" do
    belongs_to(:committed_by, Stitch.Accounts.User, foreign_key: :committed_by_id)
    field(:action, :string)
    field(:record_type, :string)
    field(:record_id, :integer)
    field(:record, :map)
    field(:source, :string)
    field(:meta, :map)

    timestamps(updated_at: false)
  end

  @spec new(Version.t(), map | nil) :: Changeset.t()
  def new(%Version{} = struct, attrs \\ %{}) do
    struct
    |> cast(attrs, [
      :committed_by_id,
      :action,
      :record_type,
      :record_id,
      :record,
      :source,
      :meta
    ])
    |> validate_required([:action, :record_type, :record])
    |> validate_inclusion(:action, ["insert", "update", "delete"])
  end

  @spec insert(struct, map | nil) :: {:ok, struct()} | {:error, Ecto.Changeset.t()}
  def insert(target_record, options \\ %{}), do: create("insert", target_record, options)

  @spec update(struct, map | nil) :: {:ok, struct()} | {:error, Ecto.Changeset.t()}
  def update(target_record, options \\ %{}), do: create("update", target_record, options)

  @spec delete(struct, map | nil) :: {:ok, struct()} | {:error, Ecto.Changeset.t()}
  def delete(target_record, options \\ %{}), do: create("delete", target_record, options)

  @spec create(String.t(), struct, map | nil) :: {:ok, struct()} | {:error, Ecto.Changeset.t()}
  def create(action, target_record, options) do
    %Version{}
    |> new(%{
      action: action,
      record_type: get_struct_type(target_record),
      record_id: target_record.id,
      record: serialize(target_record),
      committed_by_id: get_committed_by_id(options),
      source: options[:source],
      meta: options[:meta]
    })
    |> Repo.insert()
  end

  def get_committed_by_id(%{committed_by: %User{id: user_id}}), do: user_id
  def get_committed_by_id(_options), do: nil

  defp get_struct_type(%{__struct__: module}) do
    [_ | originator_type] = module |> Module.split()
    originator_type |> Enum.join(".")
  end

  defp serialize(struct) do
    relationships = struct.__struct__.__schema__(:associations)
    Map.drop(struct, [:__struct__, :__meta__] ++ relationships)
  end
end
