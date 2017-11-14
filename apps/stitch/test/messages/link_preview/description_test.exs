defmodule Stitch.Message.LinkPreview.DescriptionTest do
  use Stitch.DataCase
  alias Stitch.Message.LinkPreview

  test "og:description" do
    html = ~s[<head><meta property="og:description" content="Foo" /></head>]
    assert LinkPreview.description(html) == "Foo"
  end

  test "<meta name='description'>" do
    html = ~s[<head><meta name="description" content="Foo" /></head>]
    assert LinkPreview.description(html) == "Foo"
  end

  test "none" do
    html = ~s[<head></head>]
    assert LinkPreview.description(html) == nil
  end
end
