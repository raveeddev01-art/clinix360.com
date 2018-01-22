defmodule Stitch.Invitation.SingleRoomGuestInvite do
  @moduledoc false
  use Ecto.Schema
  import Ecto.Changeset

  embedded_schema do
    field :email, :string
    field :group_id, :integer
  end

  @doc false
  def changeset(params \\ %{}) do
    %__MODULE__{}
    |> cast(params, ~w(email group_id)a)
    |> validate_required(~w(email group_id)a)
    |> validate_format(:email, ~r"@")
  end
end
