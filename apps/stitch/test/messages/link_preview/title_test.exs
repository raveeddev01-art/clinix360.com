defmodule Stitch.Message.LinkPreview.TitleTest do
  use Stitch.DataCase
  alias Stitch.Message.LinkPreview

  test "og:title" do
    html = ~s[<head><meta property="og:title" content="Foo" /></head>]
    assert LinkPreview.title(html) == "Foo"
  end

  test "<title>" do
    html = ~s[<head><title>Foo</title></head>]
    assert LinkPreview.title(html) == "Foo"
  end

  test "none" do
    html = ~s[<head></head>]
    assert LinkPreview.title(html) == nil
  end
end
