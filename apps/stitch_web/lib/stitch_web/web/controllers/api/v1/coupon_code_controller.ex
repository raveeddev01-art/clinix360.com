defmodule Stitch.Web.Api.V1.CouponCodeController do
  use Stitch.Web, :controller
  alias Stitch.Coupons

  def validate_coupon(conn, %{"code" => code}) do
    Coupons.validate_coupon_code(code)
    |> return_message(conn)
  end

  defp return_message(:valid_coupon_code, conn) do
    json(
      conn,
      %{
        message: "Coupon code is valid.",
        success: true
      }
    )
  end

  defp return_message(:invalid_coupon_code, conn) do
    json(
      conn,
      %{
        message: "Coupon code you entered doesn't exists!",
        success: false
      }
    )
  end

  defp return_message(:coupon_already_used, conn) do
    json(
      conn,
      %{
        message: "Coupon code you entered is already used!",
        success: false
      }
    )
  end
end
