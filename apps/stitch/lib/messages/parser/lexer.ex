defmodule Stitch.Message.Parser.Lexer do
  alias Stitch.Message.Parser.Lexer

  defstruct position: 0, input: "", tokens: [], open_tokens: %{}

  def try(input) do
    res = new(input) |> next
    for t <- res.tokens do
      IO.inspect [t, String.slice(input, t.start, t.end - t.start)]
    end
  end

  def new(input) do
    %Lexer{input: input}
  end

  def parse_token(token_name, size, input_stream, input) do
    if token = input.open_tokens[token_name] do
      token = %{ token | end: input.position + size }
      input = %{ input | input: input_stream,
                          position: input.position + size,
                          tokens: [token | input.tokens],
                          open_tokens: Map.delete(input.open_tokens, token_name) }
      next(input)
    else
      token = %{ type: token_name, start: input.position, end: nil }
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
    token = %{ type: "code_block", start: input.position, end: nil}
    input = %{ input | input: input_stream,
                       position: input.position + 3,
                       open_tokens: Map.put(input.open_tokens, "code_block", token) }
    read_code_block(input)
  end

  def next(%{input: "`" <> input_stream} = input) do
    token = %{ type: "code", start: input.position, end: nil}
    input = %{ input | input: input_stream,
                       position: input.position + 1,
                       open_tokens: Map.put(input.open_tokens, "code", token) }
    read_code(input)
  end

  def next(%{input: "<@U" <> input_stream} = input) do
    token = %{ type: "mention", start: input.position, end: nil}
    input = %{input | input: input_stream,
                      position: input.position + 3, open_tokens:
                      Map.put(input.open_tokens, "mention", token)}
    read_mention(input)
  end

  def next(%{input: ""} = input) do
    input
  end

  def next(%{input: input_stream} = input) do
    {_codepoint, rest} = String.next_codepoint(input_stream)
    input = %{ input | input: rest, position: input.position + 1 }
    next(input)
  end

  def read_code(%{input: input_stream} = input) do
    case Regex.run(~r/\`/, input_stream, return: :index) do
      nil ->
        input = %{input | open_tokens: Map.delete(input.open_tokens, "code") }
        next(input)
      [{index, _length}] ->
        token = input.open_tokens["code"]
        token = %{ token | end: input.position + index + 1 }
        input = %{ input | input: String.slice(input_stream, index + 1..-1),
                           position: input.position + index + 1,
                           tokens: [token | input.tokens],
                           open_tokens: Map.delete(input.open_tokens, "code") }
        next(input)
    end
  end

  def read_code_block(%{input: input_stream} = input) do
    case Regex.run(~r/\`\`\`/, input_stream, return: :index) do
      nil ->
        input = %{input | open_tokens: Map.delete(input.open_tokens, "code_block") }
        next(input)
      [{index, _length}] ->
        token = input.open_tokens["code_block"]
        token = %{ token | end: input.position + index + 3 }
        input = %{ input | input: String.slice(input_stream, index + 3..-1),
                           position: input.position + index + 3,
                           tokens: [token | input.tokens],
                           open_tokens: Map.delete(input.open_tokens, "code_block") }
        next(input)
    end
  end

  def read_mention(%{input: input_stream} = input) do
    case read_user_id(input_stream, {input.position, ""}) do
      {:end, rest, pos, acc} ->
        token = input.open_tokens["mention"]
        token = Map.merge(token, %{end: pos, id: String.to_integer(acc)})
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
