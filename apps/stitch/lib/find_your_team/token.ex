defmodule Stitch.FindYourTeam.Token do
  use Ecto.Schema
  import Ecto.Changeset
  alias Stitch.FindYourTeam.Token

  schema "find_your_team_tokens" do
    field :email
    field :token
    field :type

    timestamps updated_at: false
  end

  def changeset(%Token{} = token, attrs) do
    token
    |> cast(attrs, [:email, :token, :type])
    |> unique_constraint(:email)
    |> validate_inclusion(:type, ["team_list", "login"])
  end
end
