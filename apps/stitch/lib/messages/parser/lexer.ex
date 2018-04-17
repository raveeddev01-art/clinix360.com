defmodule Stitch.Message.Parser.Lexer do
  alias Stitch.Message.Parser.Lexer

  defstruct position: 0, input: "", tokens: [], open_tokens: %{}

  def try(input) do
    res = new(input) |> next
    IO.inspect ["input: ", input]
    IO.inspect res
    for t <- res.tokens do
      IO.inspect [t.type, String.slice(input, t.pos_start, t.pos_end - t.pos_start)]
    end
  end

  def new(input) do
    %Lexer{input: input}
  end

  def parse_token(token_name, size, input_stream, input) do
    if token = input.open_tokens[token_name] do
      token = %{ token | pos_end: input.position + size }
      input = %{ input | input: input_stream,
                          position: input.position + size,
                          tokens: [token | input.tokens],
                          open_tokens: Map.delete(input.open_tokens, token_name) }
      next(input)
    else
      token = %{ type: token_name, pos_start: input.position, pos_end: nil }
      input = %{ input | input: input_stream,
                          position: input.position + size,
                          open_tokens: Map.put(input.open_tokens, token_name, token) }
      next(input)
    end
  end

  def next(%{input: "*" <> input_stream} = input) do
    parse_token("em", 1, input_stream, input)
  end

  def next(%{input: "_" <> input_stream} = input) do
    parse_token("it", 1, input_stream, input)
  end

  def next(%{input: "~" <> input_stream} = input) do
    parse_token("st", 1, input_stream, input)
  end

  def next(%{input: "```" <> input_stream} = input) do
    parse_token("code_multi", 1, input_stream, input)
  end

  def next(%{input: "`" <> input_stream} = input) do
    parse_token("code", 1, input_stream, input)
  end

  def next(%{input: "<@U" <> input_stream} = input) do
    token = %{ type: "mention", pos_start: input.position, pos_end: nil}
    input = %{input | input: input_stream, position: input.position + 3, open_tokens: Map.put(input.open_tokens, "mention", token)}
    read_mention(input)
  end

  def next(%{input: ""} = input) do
    input
  end

  def next(%{input: input_stream} = input) do
    {_codepoint, rest} = String.next_codepoint(input_stream)
    # SKIP 1
    input = %{ input | input: rest, position: input.position + 1 }
    next(input)
  end

  # ---


  def read_mention(%{input: input_stream} = input) do
    case read_user_id(input_stream, {input.position, ""}) do
      {:end, rest, pos, _acc} ->
        token = input.open_tokens["mention"]
        token = %{ token | pos_end: pos }
        input = %{ input | input: rest,
                            position: pos,
                            tokens: [token | input.tokens],
                            open_tokens: Map.delete(input.open_tokens, "mention") }
        next(input)
      {:cancel, rest, pos, nil} ->
        input = %{ input | input: rest, position: pos + 1 }
        next(input)
    end
  end



  def read_user_id(">" <> rest, {pos, acc}), do: {:end, rest, pos + 1, acc}

  def read_user_id(<<int :: size(8), data :: binary>>, {pos, acc}) when int in 48..57 do
    acc = acc <> <<int>>
    read_user_id(data, {pos + 1, acc})
  end

  def read_user_id(binary, {pos, _acc}) do
    {:cancel, binary, pos, nil}
  end
end
