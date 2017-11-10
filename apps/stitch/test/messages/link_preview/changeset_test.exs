defmodule Stitch.Message.LinkPreview.ChangesetTest do
  use Stitch.DataCase
  alias Stitch.Message.LinkPreview

  test "requires link" do
    changeset = LinkPreview.changeset(%LinkPreview{}, %{})

    refute changeset.valid?
  end

  test "resolves relative image URLs" do
    changeset = LinkPreview.changeset(%LinkPreview{}, %{
      link: "http://foo.bar",
      image_url: "http://foo.bar/logo.png"
    })
    assert changeset.changes.image_url == "http://foo.bar/logo.png"

    changeset = LinkPreview.changeset(%LinkPreview{}, %{
      link: "http://foo.bar",
      image_url: "http://baz.qux/logo.png"
    })
    assert changeset.changes.image_url == "http://baz.qux/logo.png"

    changeset = LinkPreview.changeset(%LinkPreview{}, %{
      link: "http://foo.bar",
      image_url: "/logo.png"
    })
    assert changeset.changes.image_url == "http://foo.bar/logo.png"

    changeset = LinkPreview.changeset(%LinkPreview{}, %{
      link: "http://foo.bar/path?query=value",
      image_url: "/logo.png"
    })
    assert changeset.changes.image_url == "http://foo.bar/logo.png"

    changeset = LinkPreview.changeset(%LinkPreview{link: "http://foo.bar"}, %{
      image_url: "/logo.png"
    })
    assert changeset.changes.image_url == "http://foo.bar/logo.png"

    changeset = LinkPreview.changeset(%LinkPreview{}, %{
      link: "http://foo.bar",
      image_url: nil
    })
    refute Map.has_key?(changeset.changes, :image_url)

    changeset = LinkPreview.changeset(%LinkPreview{
      link: "http://foo.bar",
      image_url: "http://foo.bar/logo.png"},
      %{
        image_url: nil
      })
    assert changeset.changes.image_url == nil

    changeset = LinkPreview.changeset(%LinkPreview{
      link: "http://foo.bar",
      image_url: "http://foo.bar/logo.png"},
      %{
        link: "http://baz.qux"
      })
    refute Map.has_key?(changeset.changes, :image_url)
  end
end
