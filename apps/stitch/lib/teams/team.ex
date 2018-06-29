defmodule Stitch.Team do
  use Ecto.Schema
  import Ecto.Changeset
  alias Stitch.Repo

  schema "teams" do
    field(:name, :string)
    field(:slug, :string)
    field(:security_lockout, :boolean, default: false)
    field(:seconds_to_lockout, :integer)
    field(:open_invitations_enabled, :boolean, default: true)
    field(:is_legacy, :boolean, default: false)
    field(:company_name, :string)
    field(:address_line_one, :string)
    field(:address_line_two, :string)
    field(:city, :string)
    field(:state, :string)
    field(:country, :string)
    field(:zip_code, :string)
    field(:ehr, :string)
    field(:industry, :string)
    field(:size, :string)
    field(:conceal_enabled, :boolean, default: true)

    has_many(:users, Stitch.Accounts.User, on_delete: :delete_all)
    has_many(:invitations, Stitch.Invitation, on_delete: :delete_all)
    has_one(:subscription, Stitch.Billing.Subscription, on_delete: :delete_all)
    has_many(:payment_methods, Stitch.Billing.PaymentMethod, on_delete: :delete_all)
    has_many(:features, Stitch.TeamFeature, on_delete: :delete_all)

    # Connect
    has_many(:groups, Stitch.Group, on_delete: :delete_all)
    has_many(:exports, Stitch.Exports.Export, on_delete: :delete_all)

    # Patients
    has_many(:patients, Stitch.Patient)

    # Engage
    has_many(:inboxes, Stitch.Engage.Inbox, on_delete: :delete_all)

    timestamps()
  end

  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [
      :name,
      :slug,
      :security_lockout,
      :seconds_to_lockout,
      :open_invitations_enabled,
      :ehr,
      :industry,
      :size
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
    |> validate_format(:zip_code, ~r(^\d{5}(\-\d{4}\)?$))
  end

  def complete_onboarding(params) do
    team = Repo.get(Stitch.Team, params["team_id"])

    attrs_to_update = %{
      ehr: params["team_ehr"],
      industry: params["team_industry"],
      size: params["team_size"]
    }

    cs = changeset(team, attrs_to_update)

    case Repo.update(cs) do
      {:ok, team} ->
        Stitch.Analytics.Team.identify_and_group(team)
        {:ok, team}

      {:error, changeset} ->
        {:error, changeset}
    end
  end
end
