defmodule Stitch.Team do
  use Ecto.Schema
  import Ecto.Changeset

  schema "teams" do
    field(:name, :string)
    field(:slug, :string)
    field(:security_lockout, :boolean, default: false)
    field(:seconds_to_lockout, :integer)
    field(:open_invitations_enabled, :boolean, default: false)
    field(:is_legacy, :boolean, default: false)
    field(:company_name, :string)
    field(:address_line_one, :string)
    field(:address_line_two, :string)
    field(:city, :string)
    field(:state, :string)
    field(:country, :string)
    field(:zip_code, :string)

    has_many(:users, Stitch.Accounts.User, on_delete: :delete_all)
    has_many(:groups, Stitch.Group, on_delete: :delete_all)
    has_many(:invitations, Stitch.Invitation, on_delete: :delete_all)
    has_many(:exports, Stitch.Exports.Export, on_delete: :delete_all)
    has_one(:subscription, Stitch.Billing.Subscription, on_delete: :delete_all)
    has_many(:payment_methods, Stitch.Billing.PaymentMethod, on_delete: :delete_all)

    timestamps()
  end

  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [
      :name,
      :slug,
      :security_lockout,
      :seconds_to_lockout,
      :open_invitations_enabled
    ])
    |> validate_required([:name, :slug, :security_lockout, :open_invitations_enabled])
    |> validate_number(:seconds_to_lockout, greater_than: 10)
    |> unique_constraint(:slug)
  end

  def contact_info_changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [
      :name,
      :city,
      :state,
      :country,
      :zip_code,
      :company_name,
      :address_line_one,
      :address_line_two
    ])
    |> validate_required([:company_name, :address_line_one, :city, :state, :country, :zip_code])
    |> Stitch.Validators.validate_country_iso_alpha(:country)
    |> validate_format(:zip_code, ~r(\d{5,5}\-\d{3,3}$))
  end
end
