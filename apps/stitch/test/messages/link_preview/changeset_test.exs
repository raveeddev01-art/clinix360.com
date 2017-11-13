defmodule Stitch.Message.LinkPreview.ChangesetTest do
  use Stitch.DataCase
  alias Stitch.Message.LinkPreview

  test "requires link" do
    changeset = LinkPreview.changeset(%LinkPreview{}, %{title: "Foo"})

    refute changeset.valid?
    assert changeset.errors == [link: {"can't be blank", [validation: :required]}]
  end

  test "requires title" do
    changeset = LinkPreview.changeset(%LinkPreview{}, %{link: "http://foo.bar"})

    refute changeset.valid?
    assert changeset.errors == [title: {"can't be blank", [validation: :required]}]
  end

  test "resolves relative image URLs" do
    changeset = LinkPreview.changeset(%LinkPreview{}, %{
      link: "http://foo.bar",
      title: "Foo",
      image_url: "http://foo.bar/logo.png"
    })
    assert changeset.changes.image_url == "http://foo.bar/logo.png"

    changeset = LinkPreview.changeset(%LinkPreview{}, %{
      link: "http://foo.bar",
      title: "Foo",
      image_url: "http://baz.qux/logo.png"
    })
    assert changeset.changes.image_url == "http://baz.qux/logo.png"

    changeset = LinkPreview.changeset(%LinkPreview{}, %{
      link: "http://foo.bar",
      title: "Foo",
      image_url: "/logo.png"
    })
    assert changeset.changes.image_url == "http://foo.bar/logo.png"

    changeset = LinkPreview.changeset(%LinkPreview{}, %{
      link: "http://foo.bar/path?query=value",
      title: "Foo",
      image_url: "/logo.png"
    })
    assert changeset.changes.image_url == "http://foo.bar/logo.png"

    changeset = LinkPreview.changeset(%LinkPreview{link: "http://foo.bar"}, %{
      title: "Foo",
      image_url: "/logo.png"
    })
    assert changeset.changes.image_url == "http://foo.bar/logo.png"

    changeset = LinkPreview.changeset(%LinkPreview{}, %{
      link: "http://foo.bar",
      title: "Foo",
      image_url: nil
    })
    refute Map.has_key?(changeset.changes, :image_url)

    changeset = LinkPreview.changeset(%LinkPreview{
      link: "http://foo.bar",
      title: "Foo",
      image_url: "http://foo.bar/logo.png"},
      %{
        image_url: nil
      })
    assert changeset.changes.image_url == nil

    changeset = LinkPreview.changeset(%LinkPreview{
      link: "http://foo.bar",
      title: "Foo",
      image_url: "http://foo.bar/logo.png"},
      %{
        link: "http://baz.qux"
      })
    refute Map.has_key?(changeset.changes, :image_url)
  end
end
