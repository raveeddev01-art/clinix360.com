defmodule Stitch.ProfileImageTest do
  use Stitch.DataCase, async: true
  alias Stitch.Accounts.ProfileImage

  describe "Stitch.Accounts.ProfileImage.pick_default_random/0" do
    test "it should return avatar randomly" do
      avatar = ProfileImage.pick_default_random()
      Application.get_env(:stitch_connect, :application_host)
      assert String.contains?(avatar.image_url, "default")
      assert String.contains?(avatar.thumb_url, "default")
    end
  end

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