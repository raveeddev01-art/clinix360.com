defmodule Stitch.Mobile.Device do
  use Ecto.Schema
  import Ecto.Changeset
  alias Stitch.Mobile.Device

  schema "mobile_devices" do
    belongs_to :user, Stitch.Accounts.User
    field :name
    field :type
    field :token

    timestamps()
  end

  def changeset(%Device{} = device, attrs) do
    device
    |> cast(attrs, [:user_id, :name, :type, :token])
  end
end
