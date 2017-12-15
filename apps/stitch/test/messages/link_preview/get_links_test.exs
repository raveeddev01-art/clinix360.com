defmodule Stitch.Message.LinkPreview.GetLinksTest do
  use ExUnit.Case, async: true

  test "returns a list of links" do
    Enum.each %{
      nil => [],
      "" => [],
      "foo" => [],
      "http://" => [],
      "https://" => [],
      "http://foo.bar" => ["http://foo.bar"],
      "https://foo.bar" => ["https://foo.bar"],
      "lorem http://foo.bar" => ["http://foo.bar"],
      "http://foo.bar lorem" => ["http://foo.bar"],
      "lorem http://foo.bar ipsum" => ["http://foo.bar"],
      "\n\t http://foo.bar \n\t" => ["http://foo.bar"],
      "http://foo.bar/baz?qux=quux" => ["http://foo.bar/baz?qux=quux"],
      "http://foo\nhttp://bar" => ["http://foo", "http://bar"],
    }, fn {text, links} ->
      assert Stitch.Message.LinkPreview.get_links(text) == links
    end
  end
end
