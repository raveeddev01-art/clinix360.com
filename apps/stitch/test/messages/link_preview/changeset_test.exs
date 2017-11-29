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

  test "resolves relative favicons and image URLs" do
    changeset = LinkPreview.changeset(%LinkPreview{}, %{
      link: "http://foo.bar",
      title: "Foo",
      favicon_url: "http://foo.bar/favicon.ico",
      image_url: "http://foo.bar/logo.png"
    })
    assert changeset.changes.favicon_url == "http://foo.bar/favicon.ico"
    assert changeset.changes.image_url == "http://foo.bar/logo.png"

    changeset = LinkPreview.changeset(%LinkPreview{}, %{
      link: "http://foo.bar",
      title: "Foo",
      favicon_url: "http://baz.qux/favicon.ico",
      image_url: "http://baz.qux/logo.png"
    })
    assert changeset.changes.favicon_url == "http://baz.qux/favicon.ico"
    assert changeset.changes.image_url == "http://baz.qux/logo.png"

    changeset = LinkPreview.changeset(%LinkPreview{}, %{
      link: "http://foo.bar",
      title: "Foo",
      favicon_url: "/favicon.ico",
      image_url: "/logo.png"
    })
    assert changeset.changes.favicon_url == "http://foo.bar/favicon.ico"
    assert changeset.changes.image_url == "http://foo.bar/logo.png"

    changeset = LinkPreview.changeset(%LinkPreview{}, %{
      link: "http://foo.bar/path?query=value",
      title: "Foo",
      favicon_url: "/favicon.ico",
      image_url: "/logo.png"
    })
    assert changeset.changes.favicon_url == "http://foo.bar/favicon.ico"
    assert changeset.changes.image_url == "http://foo.bar/logo.png"

    changeset = LinkPreview.changeset(%LinkPreview{link: "http://foo.bar"}, %{
      title: "Foo",
      favicon_url: "/favicon.ico",
      image_url: "/logo.png"
    })
    assert changeset.changes.favicon_url == "http://foo.bar/favicon.ico"
    assert changeset.changes.image_url == "http://foo.bar/logo.png"

    changeset = LinkPreview.changeset(%LinkPreview{}, %{
      link: "http://foo.bar",
      title: "Foo",
      favicon_url: nil,
      image_url: nil
    })
    refute Map.has_key?(changeset.changes, :favicon_url)
    refute Map.has_key?(changeset.changes, :image_url)

    changeset = LinkPreview.changeset(%LinkPreview{
      link: "http://foo.bar",
      title: "Foo",
      favicon_url: "http://foo.bar/favicon.ico",
      image_url: "http://foo.bar/logo.png"
    }, %{
      favicon_url: nil,
      image_url: nil
    })
    assert changeset.changes.favicon_url == nil
    assert changeset.changes.image_url == nil

    changeset = LinkPreview.changeset(%LinkPreview{
      link: "http://foo.bar",
      title: "Foo",
      favicon_url: "http://foo.bar/favicon.ico",
      image_url: "http://foo.bar/logo.png"},
      %{
        link: "http://baz.qux"
      })
    refute Map.has_key?(changeset.changes, :favicon_url)
    refute Map.has_key?(changeset.changes, :image_url)
  end
end
