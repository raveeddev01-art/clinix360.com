defmodule Stitch.Message.Parser do
  alias Stitch.Message.Parser.Lexer

  def get_meta(string) do
    input = Lexer.run(string)
  end

  def test(input) do
    res = Lexer.run(input)
    for t <- res.tokens do
      IO.inspect [t, String.slice(input, t.start, t.end - t.start)]
    end
  end
end
