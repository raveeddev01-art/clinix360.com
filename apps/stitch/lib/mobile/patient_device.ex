defmodule Stitch.Mobile.PatientDevice do
  use Ecto.Schema
  import Ecto.Changeset
  alias Stitch.Mobile.PatientDevice

  schema "patient_mobile_devices" do
    belongs_to(:patient, Stitch.Patient)
    field(:name)
    field(:type)
    field(:token)

    timestamps()
  end

  def changeset(%PatientDevice{} = device, attrs) do
    device
    |> cast(attrs, [:name, :type, :token])
    |> validate_required([:name, :token])
    |> validate_inclusion(:type, ["ios", "android"])
    |> unsafe_validate_unique([:token, :type], Stitch.Repo)
    |> unique_constraint(:token, name: :patient_mobile_devices_type_token_index)
  end
end
