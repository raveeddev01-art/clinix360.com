defmodule Stitch.Message.LinkPreview.ImageUrlTest do
  use Stitch.DataCase
  alias Stitch.Message.LinkPreview

  test "<meta property='og:image'>" do
    html = ~s[<head><meta property="og:image" content="/logo.png" /></head>]
    assert LinkPreview.image_url(html) == "/logo.png"
  end

  test "<meta property='og:image:url'>" do
    html = ~s[<head><meta property="og:image:url" content="/logo.png" /></head>]
    assert LinkPreview.image_url(html) == "/logo.png"
  end

  test "<link rel='icon'>" do
    html = ~s[<head><link rel="icon" href="/favicon.ico" /></head>]
    assert LinkPreview.image_url(html) == "/favicon.ico"
  end

  test "none" do
    html = ~s[<head></head>]
    assert LinkPreview.image_url(html) == nil
  end
end
