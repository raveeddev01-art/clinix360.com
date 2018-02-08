defmodule Stitch.Accounts.PasswordResetTokenTest do
  use Stitch.DataCase
  alias Stitch.Mobile
  alias Stitch.Accounts.PasswordResetToken
  alias Stitch.Repo

  test "creates a password reset token" do
    user = insert(:user)
    {:ok, password_reset_token} =
      PasswordResetToken.new(%{user_id: user.id})
      |> Repo.insert

    assert password_reset_token.user_id == user.id
    assert String.length(password_reset_token.token) == 32
  end

  test "associated password reset token with user" do
  end
end
