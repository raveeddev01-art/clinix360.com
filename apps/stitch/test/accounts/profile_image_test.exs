defmodule Stitch.ProfileImageTest do
  use Stitch.DataCase, async: true
  alias Stitch.Accounts.ProfileImage

  describe "Stitch.Accounts.ProfileImage.create_from_initials/2" do
    test "it should generated image using initials" do
      {:ok, image_path} = Stitch.Accounts.ProfileImage.create_from_initials("Sergio", "Tapia")
    end

    test "it returns error if first name or last name is empty" do
      {:error, reason} = Stitch.Accounts.ProfileImage.create_from_initials("", "Tapia")
      assert reason == "First name and last name must be sent"
      {:error, reason} = Stitch.Accounts.ProfileImage.create_from_initials("Sergio", "")
      assert reason == "First name and last name must be sent"
    end
  end
end