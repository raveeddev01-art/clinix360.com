defmodule Stitch.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do
    field :email, :string
    field :encrypted_password, :string
    field :fullname, :string

    field :password, :string, virtual: true

    timestamps()
  end

  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:fullname])
    |> validate_required([:fullname])
  end

  def registration_changeset(struct, params) do
    struct
    |> changeset(params)
    |> cast(params, [:email, :password])
    |> validate_length(:password, min: 8)
  end
end