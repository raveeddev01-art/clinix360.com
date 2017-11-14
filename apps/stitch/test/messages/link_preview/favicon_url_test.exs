defmodule Stitch.Message.LinkPreview.FaviconUrlTest do
  use Stitch.DataCase
  alias Stitch.Message.LinkPreview

  test "<link rel='icon'>" do
    html = ~s[<head><link rel="icon" href="/favicon.ico" /></head>]
    assert LinkPreview.favicon_url(html) == "/favicon.ico"
  end

  test "<link rel='shortcut icon'>" do
    html = ~s[<head><link rel="shortcut icon" href="/favicon.ico" /></head>]
    assert LinkPreview.favicon_url(html) == "/favicon.ico"
  end

  test "none" do
    html = ~s[<head></head>]
    assert LinkPreview.favicon_url(html) == nil
  end
end
