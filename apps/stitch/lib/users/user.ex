defmodule Stitch.User do
  use Ecto.Schema

  schema "users" do
    field :email, :string
    field :encrypted_password, :string
    field :fullname, :string

    timestamps()
  end
end