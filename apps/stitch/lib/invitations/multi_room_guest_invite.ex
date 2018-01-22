defmodule Stitch.Invitation.MultiRoomGuestInvite do
  @moduledoc false
  use Ecto.Schema
  import Ecto.Changeset

  embedded_schema do
    field :email, :string
    field :group_ids, {:array, :integer}
  end

  @doc false
  def changeset(params \\ %{}) do
    %__MODULE__{}
    |> cast(params, ~w(email group_ids)a)
    |> validate_required(~w(email group_ids)a)
    |> validate_format(:email, ~r"@")
    |> validate_length(:group_ids, min: 1)
  end
end
