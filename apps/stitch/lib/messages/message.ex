defmodule Stitch.Message do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Stitch.Message

  schema "messages" do
    belongs_to :user, Stitch.Accounts.User
    belongs_to :group, Stitch.Group
    field :deleted, :boolean, default: false
    field :text_content, :string
    field :fields, :map

    timestamps()
  end

  def changeset(%Stitch.Message{} = struct, params) do
    struct
    |> cast(params, [:user_id, :group_id, :deleted, :text_content, :fields])
    |> validate_required([:user_id, :group_id, :deleted, :text_content])
  end
end