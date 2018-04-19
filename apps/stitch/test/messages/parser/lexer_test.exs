defmodule Stitch.Message.ParserTest do
  use ExUnit.Case, async: true
  alias Stitch.Message.Parser.Lexer

  test "mention" do
    input = "Hi, <@U1234567>."
    res = Lexer.new(input) |> Lexer.next
    assert ["<@U1234567>"] == read_meta(input, res)
  end

  def read_meta(input, res) do
    for t <- res.tokens, do: String.slice(input, t.start, t.end - t.start)
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
        {t.type, String.slice(input, t.start, t.end - t.start)}
      end

    assert map[:emphasis] == "*emphasis*"
    assert map[:italic] == "_italic_"
    assert map[:strikethrough] == "~strikethrough~"
  end

  test "code" do
    input = "`code`"

    res = Lexer.new(input) |> Lexer.next

    map =
      for t <- res.tokens, into: %{} do
        {t.type, String.slice(input, t.start, t.end - t.start)}
      end

    assert map[:code] == "`code`"
  end

  test "here mention" do
    input = "Test <@Ghere> *mention*"
    res = Lexer.new(input) |> Lexer.next
    assert {:emphasis, "*mention*"} = get_tag(input, res.tokens, 0)
    assert {:here_mention, "<@Ghere>"} = get_tag(input, res.tokens, 1)
  end

  test "room mention" do
    input = "Test <@Groom> *mention*"
    res = Lexer.new(input) |> Lexer.next
    assert {:emphasis, "*mention*"} = get_tag(input, res.tokens, 0)
    assert {:room_mention, "<@Groom>"} = get_tag(input, res.tokens, 1)
  end

  test "everyone mention" do
    input = "Test <@Geveryone> *mention*"
    res = Lexer.new(input) |> Lexer.next
    assert {:emphasis, "*mention*"} = get_tag(input, res.tokens, 0)
    assert {:everyone_mention, "<@Geveryone>"} = get_tag(input, res.tokens, 1)
  end

  defp get_tag(input, tokens, index) do
    token = Enum.at(tokens, index)
    {token.type, String.slice(input, token.start, token.end - token.start)}
  end
end
