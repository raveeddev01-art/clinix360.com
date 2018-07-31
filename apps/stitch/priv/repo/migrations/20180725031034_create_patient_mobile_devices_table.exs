defmodule Stitch.Repo.Migrations.CreatePatientMobileDevicesTable do
  use Ecto.Migration

  def change do
    create table(:patient_mobile_devices) do
      add(:patient_id, references(:patients, on_delete: :delete_all), null: false)
      add(:name, :string, null: false)
      add(:type, :string, null: false)
      add(:token, :string, null: false)

      timestamps()
    end

    create(unique_index(:patient_mobile_devices, [:type, :token]))

    create(
      constraint(
        :patient_mobile_devices,
        :mobile_devices_name_cant_be_blank,
        check: "char_length(name) > 0"
      )
    )

    create(
      constraint(
        :patient_mobile_devices,
        :mobile_devices_token_cant_be_blank,
        check: "char_length(token) > 0"
      )
    )

    create(
      constraint(
        :patient_mobile_devices,
        :mobile_devices_type_is_either_ios_or_android,
        check: "type IN ('ios', 'android')"
      )
    )
  end
end
