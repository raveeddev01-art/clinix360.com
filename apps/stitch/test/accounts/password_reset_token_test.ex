defmodule Stitch.Accounts.PasswordResetTokenTest do
  use Stitch.DataCase
  alias Stitch.Accounts.PasswordResetToken

  test "create_for_user/1" do
    user = insert(:user)
    assert {:ok, password_reset_token} = PasswordResetToken.create_for_user(user)
    assert password_reset_token.user_id == user.id
    assert String.length(password_reset_token.token) == 32
  end

  describe "get_valid_token/1" do
    test "when token is valid" do
      user = insert(:user)
      password_reset_token = insert(:password_reset_token, user: user)
      password_reset_token = PasswordResetToken.get_valid_token(password_reset_token.token)
      assert password_reset_token.user_id == user.id
      assert password_reset_token.user.id == user.id
    end

    test "when token was created more than 24 hours ago" do
      user = insert(:user)
      password_reset_token = insert(:password_reset_token, user: user, inserted_at: day_ago())
      password_reset_token = PasswordResetToken.get_valid_token(password_reset_token.token)
      assert password_reset_token == nil
    end

    test "when token was activated more than 30 minutes ago" do
      user = insert(:user)
      password_reset_token = insert(:password_reset_token, user: user, activated_at: day_ago())
      password_reset_token = PasswordResetToken.get_valid_token(password_reset_token.token)
      assert password_reset_token == nil
    end

    test "when token was activated less than 30 minutes ago" do
      user = insert(:user)
      password_reset_token = insert(:password_reset_token, user: user, activated_at: minute_ago())
      password_reset_token = PasswordResetToken.get_valid_token(password_reset_token.token)
      assert password_reset_token != nil
    end
  end

  defp day_ago, do: Timex.shift(NaiveDateTime.utc_now, days: -1)
  defp half_an_hour_ago, do: Timex.shift(NaiveDateTime.utc_now, minutes: -30)
  defp minute_ago, do: Timex.shift(NaiveDateTime.utc_now, minutes: -1)
end
