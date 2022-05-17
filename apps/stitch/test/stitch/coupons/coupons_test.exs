defmodule Stitch.CouponsTest do
  use Stitch.DataCase

  alias Stitch.Coupons

  describe "signup_coupons" do
    alias Stitch.Coupons.SignupCoupon

    @valid_attrs %{code: "some code", is_used: true, platform: "some platform"}
    @update_attrs %{code: "some updated code", is_used: false, platform: "some updated platform"}
    @invalid_attrs %{code: nil, is_used: nil, platform: nil}

    def signup_coupon_fixture(attrs \\ %{}) do
      {:ok, signup_coupon} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Coupons.create_signup_coupon()

      signup_coupon
    end

    test "list_signup_coupons/0 returns all signup_coupons" do
      signup_coupon = signup_coupon_fixture()
      assert Coupons.list_signup_coupons() == [signup_coupon]
    end

    test "get_signup_coupon!/1 returns the signup_coupon with given id" do
      signup_coupon = signup_coupon_fixture()
      assert Coupons.get_signup_coupon!(signup_coupon.id) == signup_coupon
    end

    test "create_signup_coupon/1 with valid data creates a signup_coupon" do
      assert {:ok, %SignupCoupon{} = signup_coupon} = Coupons.create_signup_coupon(@valid_attrs)
      assert signup_coupon.code == "some code"
      assert signup_coupon.is_used == true
      assert signup_coupon.platform == "some platform"
    end

    test "create_signup_coupon/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Coupons.create_signup_coupon(@invalid_attrs)
    end

    test "update_signup_coupon/2 with valid data updates the signup_coupon" do
      signup_coupon = signup_coupon_fixture()
      assert {:ok, signup_coupon} = Coupons.update_signup_coupon(signup_coupon, @update_attrs)
      assert %SignupCoupon{} = signup_coupon
      assert signup_coupon.code == "some updated code"
      assert signup_coupon.is_used == false
      assert signup_coupon.platform == "some updated platform"
    end

    test "update_signup_coupon/2 with invalid data returns error changeset" do
      signup_coupon = signup_coupon_fixture()
      assert {:error, %Ecto.Changeset{}} = Coupons.update_signup_coupon(signup_coupon, @invalid_attrs)
      assert signup_coupon == Coupons.get_signup_coupon!(signup_coupon.id)
    end

    test "delete_signup_coupon/1 deletes the signup_coupon" do
      signup_coupon = signup_coupon_fixture()
      assert {:ok, %SignupCoupon{}} = Coupons.delete_signup_coupon(signup_coupon)
      assert_raise Ecto.NoResultsError, fn -> Coupons.get_signup_coupon!(signup_coupon.id) end
    end

    test "change_signup_coupon/1 returns a signup_coupon changeset" do
      signup_coupon = signup_coupon_fixture()
      assert %Ecto.Changeset{} = Coupons.change_signup_coupon(signup_coupon)
    end
  end
end
