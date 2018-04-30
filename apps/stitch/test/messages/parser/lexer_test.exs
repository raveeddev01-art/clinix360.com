defmodule Stitch.Message.ParserTest do
  use ExUnit.Case, async: true
  alias Stitch.Message.Parser

  test "mention" do
    input = "Hi, <@U1234567>."
    meta = Parser.get_meta(input)
    assert read_meta(input, meta) == [%{token: "<@U1234567>", text: "1234567"}]
    assert [%{id: 1234567, text: [7, 14], token: [4, 15], type: :mention}] = meta
  end

  test "mention inside emphasis" do
    input = "Hi, *<@U1234567>*."
    meta = Parser.get_meta(input)
    assert read_meta(input, meta) == [
      %{text: "<@U1234567>", token: "*<@U1234567>*"},
      %{text: "1234567", token: "<@U1234567>"}
    ]
  end

  test "emphasis, italic, strikethrough" do
    input = "*emphasis*, _italic_, ~strikethrough~"
    meta = Parser.get_meta(input)
    assert read_meta(input, meta) == [
      %{text: "strikethrough", token: "~strikethrough~"},
      %{text: "italic", token: "_italic_"},
      %{text: "emphasis", token: "*emphasis*"}
    ]
  end

  test "code" do
    input = "`code`"
    meta = Parser.get_meta(input)
    assert read_meta(input, meta) == [%{text: "code", token: "`code`"}]
  end

  test "here mention" do
    input = "Test <@Ghere> *mention*"
    meta = Parser.get_meta(input)
    assert read_meta(input, meta) == [
      %{text: "mention", token: "*mention*"},
      %{text: "here", token: "<@Ghere>"}
    ]
  end

  test "room mention" do
    input = "Test <@Groom> *mention*"
    meta = Parser.get_meta(input)
    assert read_meta(input, meta) == [
      %{text: "mention", token: "*mention*"},
      %{text: "room", token: "<@Groom>"}
    ]
  end

  test "everyone mention" do
    input = "Test <@Geveryone> *mention*"
    meta = Parser.get_meta(input)
    assert read_meta(input, meta) == [
      %{text: "mention", token: "*mention*"},
      %{text: "everyone", token: "<@Geveryone>"}
    ]
  end

  test "link" do
    input = "Test https://google.com?query=q http://github.com `test`"
    meta = Parser.get_meta(input)
    assert read_meta(input, meta) == [
      %{text: "test", token: "`test`"},
      %{text: "http://github.com", token: "http://github.com"},
      %{text: "https://google.com?query=q", token: "https://google.com?query=q"}
    ]
  end

  test "code takes precedence over other tags" do
    input = "`*Test* https://google.com?query=q`"
    meta = Parser.get_meta(input)
    assert read_meta(input, meta) == [
      %{text: "*Test* https://google.com?query=q", token: "`*Test* https://google.com?query=q`"}
    ]
  end

  test "code block takes precedence over code" do
    input = """
    ```
    `*Test* https://google.com?query=q`
    ```
    """

    meta = Parser.get_meta(input)
    assert read_meta(input, meta) == [
      %{text: "\n`*Test* https://google.com?query=q`\n", token: "```\n`*Test* https://google.com?query=q`\n```"}
    ]
  end

  test "blockquote can contain other tags" do
    input = """
    Test blockquote
    > `*Test* https://google.com?query=q`
    """

    meta = Parser.get_meta(input)
    assert read_meta(input, meta) == [
      %{text: "`*Test* https://google.com?query=q`\n", token: "> `*Test* https://google.com?query=q`\n"},
      %{text: "*Test* https://google.com?query=q", token: "`*Test* https://google.com?query=q`"}
    ]
  end

  defp read_meta(input, tokens) do
    for %{token: [token_start, token_end], text: [text_start, text_end]} <- tokens do
      %{
        token: String.slice(input, token_start, token_end - token_start),
        text: String.slice(input, text_start, text_end - text_start),
      }
    end
  end
end
