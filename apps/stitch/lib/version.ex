defmodule Stitch.Version do
  @moduledoc """
  Tracks record changes.
  """

  alias Stitch.{Version, Repo}

  use Ecto.Schema
  import Ecto.Changeset

  @type t :: %__MODULE__{}

  schema "versions" do
    field(:event, :string)
    field(:record_type, :string)
    field(:record_id, :integer)
    field(:record, :map)
    field(:originator_id, :integer)
    field(:originator_type, :string)
    field(:meta, :map)

    timestamps(updated_at: false)
  end

  @spec new(Version.t(), map | nil) :: Changeset.t()
  def new(%Version{} = struct, attrs \\ %{}) do
    struct
    |> cast(attrs, [
      :event,
      :record_type,
      :record_id,
      :record,
      :originator_id,
      :originator_type,
      :meta
    ])
    |> validate_required([:event, :record_type, :record])
  end

  @spec insert(struct, map | nil) :: {:ok, struct()} | {:error, Ecto.Changeset.t()}
  def insert(target_record, options \\ %{}), do: create("insert", target_record, options)

  @spec update(struct, map | nil) :: {:ok, struct()} | {:error, Ecto.Changeset.t()}
  def update(target_record, options \\ %{}), do: create("update", target_record, options)

  @spec create(String.t(), struct, map | nil) :: {:ok, struct()} | {:error, Ecto.Changeset.t()}
  def create(event_type, target_record, options \\ %{}) do
    originator = get_originator(options[:originator])

    %Version{}
    |> new(%{
      event: event_type,
      record_type: get_struct_type(target_record),
      record_id: target_record.id,
      record: serialize(target_record),
      originator_id: originator[:id],
      originator_type: originator[:type],
      meta: options[:meta]
    })
    |> Repo.insert()
  end

  defp get_originator(%__struct__{id: id} = struct) do
    %{id: id, type: get_struct_type(struct)}
  end

  defp get_originator(string) do
    %{type: string}
  end

  defp get_struct_type(%{__struct__: module}) do
    [_ | originator_type] = module |> Module.split()
    originator_type |> Enum.join(".")
  end

  defp serialize(struct) do
    relationships = struct.__struct__.__schema__(:associations)
    Map.drop(struct, [:__struct__, :__meta__] ++ relationships)
  end
end
