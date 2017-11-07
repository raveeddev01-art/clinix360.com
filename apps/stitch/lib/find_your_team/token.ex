defmodule Stitch.FindYourTeam.Token do
  use Ecto.Schema
  import Ecto.Changeset
  alias Stitch.FindYourTeam.Token

  schema "find_your_team_tokens" do
    field :email
    field :token

    timestamps updated_at: false
  end

  def changeset(%Token{} = token, attrs) do
    token
    |> cast(attrs, [:email, :token])
    |> unique_constraint(:email)
  end
end
