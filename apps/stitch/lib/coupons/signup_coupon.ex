defmodule Stitch.Coupons.SignupCoupon do
  use Ecto.Schema
  import Ecto.Changeset


  schema "signup_coupons" do
    field :code, :string
    field :is_used, :boolean, default: false
    field :platform, :string
    field :team_id, :integer
    field :user_id, :integer

    timestamps()
  end

  @doc false
  def changeset(signup_coupon, attrs) do
    signup_coupon
    |> cast(attrs, [:code, :is_used, :platform, :team_id, :user_id])
    |> validate_required([:code, :is_used, :platform])
    |> unique_constraint(:code)
  end
end
