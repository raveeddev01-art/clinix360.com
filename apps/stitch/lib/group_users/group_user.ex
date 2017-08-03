defmodule Stitch.GroupUser do
  use Ecto.Schema
  import Ecto.Changeset

  schema "group_users" do
    belongs_to :group, Stitch.Group
    belongs_to :user, Stitch.Accounts.User

    timestamps()
  end

  def changeset(%Stitch.GroupUser{} = struct, params) do
    struct
    |> cast(params, [:group_id, :user_id])
    |> validate_required([:group_id, :user_id])
    |> unique_constraint(:user_id, name: :group_users_group_user_id_unique_index)
  end
end