defmodule Stitch.ProfileImageTest do
  use Stitch.DataCase, async: true
  alias  Stitch.Accounts.ProfileImage

  describe "Stitch.Accounts.ProfileImage.pick_default_random/0" do
    test "it should return avatar randomly" do
      avatar = ProfileImage.pick_default_random()
      host = Application.get_env(:stitch_connect, :application_host)
      assert String.contains?(avatar.image_url, "default")
      assert String.contains?(avatar.thumb_url, "default")
    end
  end
end
