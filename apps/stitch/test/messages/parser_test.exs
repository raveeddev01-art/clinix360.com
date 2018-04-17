defmodule Stitch.Message.ParserTest do
  use ExUnit.Case, async: true
  alias Stitch.Message.Parser.Lexer

  test "mention" do
    input = "Hi, <@U1234567>."
    res = Lexer.new(input) |> Lexer.next
    assert ["<@U1234567>"] == read_meta(input, res)
  end

  def read_meta(input, res) do
    for t <- res.tokens, do: String.slice(input, t.pos_start, t.pos_end - t.pos_start)
  end

  test "mention inside emphasis" do
    input = "Hi, *<@U1234567>*."
    res = Lexer.new(input) |> Lexer.next
    assert ["*<@U1234567>*", "<@U1234567>"] == read_meta(input, res)
  end

  test "emphasis, italic, strikethrough" do
    input = "*emphasis*, _italic_, ~strikethrough~"

    res = Lexer.new(input) |> Lexer.next

    map =
      for t <- res.tokens, into: %{} do
        {t.type, String.slice(input, t.pos_start, t.pos_end - t.pos_start)}
      end

    assert map["em"] == "*emphasis*"
    assert map["it"] == "_italic_"
    assert map["st"] == "~strikethrough~"
  end

  test "code" do
    input = "`code`"

    res = Lexer.new(input) |> Lexer.next

    map =
      for t <- res.tokens, into: %{} do
        {t.type, String.slice(input, t.pos_start, t.pos_end - t.pos_start)}
      end

    assert map["code"] == "`code`"
  end
end
