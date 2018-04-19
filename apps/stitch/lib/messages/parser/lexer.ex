defmodule Stitch.Message.Parser.Lexer do
  alias Stitch.Message.Parser.Lexer

  defstruct position: 0, input: "", tokens: [], open_tokens: %{}, new_line: true

  def try(input) do
    res = new(input) |> next |> IO.inspect
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
                          new_line: false,
                          open_tokens: Map.delete(input.open_tokens, token_name) }
      next(input)
    else
      token = %{ type: token_name, start: input.position, end: nil }
      input = %{ input | input: input_stream,
                          position: input.position + size,
                          new_line: false,
                          open_tokens: Map.put(input.open_tokens, token_name, token) }
      next(input)
    end
  end

  def next(%{input: "> " <> input_stream, new_line: true} = input) do
    token = %{ type: :blockquote, start: input.position, end: nil }
    input = %{ input | input: input_stream,
                        position: input.position + 2,
                        new_line: false,
                        open_tokens: Map.put(input.open_tokens, :blockquote, token) }
    next(input)
  end

  def next(%{input: "*" <> input_stream} = input) do
    parse_token(:emphasis, 1, input_stream, input)
  end

  def next(%{input: "_" <> input_stream} = input) do
    parse_token(:italic, 1, input_stream, input)
  end

  def next(%{input: "~" <> input_stream} = input) do
    parse_token(:strikethrough, 1, input_stream, input)
  end

  def next(%{input: "```" <> input_stream} = input) do
    token = %{ type: :code_block, start: input.position, end: nil}
    input = %{ input | input: input_stream,
                       position: input.position + 3,
                       new_line: false,
                       open_tokens: Map.put(input.open_tokens, :code_block, token) }
    read_code_block(input)
  end

  def next(%{input: "`" <> input_stream} = input) do
    token = %{ type: :code, start: input.position, end: nil}
    input = %{ input | input: input_stream,
                       position: input.position + 1,
                       new_line: false,
                       open_tokens: Map.put(input.open_tokens, :code, token) }
    read_code(input)
  end

  def next(%{input: "+" <> input_stream} = input) do
    token = %{type: :everyone_mention, start: input.position, end: input.position + 12}
    input = %{input | input: input_stream,
                      position: input.position + 12,
                      new_line: false,
                      tokens: [token | input.tokens]}
    next(input)
  end

  def next(%{input: "<@Ghere>" <> input_stream} = input) do
    read_group_mention(:here_mention, input_stream, input, 8)
  end

  def next(%{input: "<@Groom>" <> input_stream} = input) do
    read_group_mention(:room_mention, input_stream, input, 8)
  end

  def next(%{input: "<@Geveryone>" <> input_stream} = input) do
    read_group_mention(:everyone_mention, input_stream, input, 12)
  end

  def next(%{input: "<@U" <> input_stream} = input) do
    token = %{ type: :mention, start: input.position, end: nil}
    input = %{input | input: input_stream,
                      position: input.position + 3,
                      new_line: false,
                      open_tokens: Map.put(input.open_tokens, :mention, token)}
    read_mention(input)
  end

  def next(%{input: "\n" <> rest} = input), do: read_newline(input, rest)
  def next(%{input: "\r\n" <> rest} = input), do: read_newline(input, rest)

  def next(%{input: ""} = input) do
    close_blockquote(input, "")
  end

  def next(%{input: input_stream} = input) do
    {_codepoint, rest} = String.next_codepoint(input_stream)
    input = %{ input | input: rest, position: input.position + 1, new_line: false }
    next(input)
  end

  def read_newline(input, rest) do
    input = close_blockquote(input, rest)
    next(input)
  end

  def read_group_mention(mention, input_stream, input, size) do
    token = %{type: mention, start: input.position, end: input.position + size}
    input = %{input | input: input_stream,
                      position: input.position + size,
                      new_line: false,
                      tokens: [token | input.tokens]}
    next(input)
  end

  def close_blockquote(input, rest) do
    if token = input.open_tokens[:blockquote] do
      token = %{ token | end: input.position + 1 }
      %{ input | input: rest,
                 position: input.position + 1,
                 new_line: true,
                 tokens: [token | input.tokens],
                 open_tokens: Map.delete(input.open_tokens, :blockquote) }
    else
      %{ input | input: rest, position: input.position + 1, new_line: true }
    end
  end

  def read_code(%{input: input_stream} = input) do
    case Regex.run(~r/\`/, input_stream, return: :index) do
      nil ->
        input = %{input | open_tokens: Map.delete(input.open_tokens, :code) }
        next(input)
      [{index, _length}] ->
        token = input.open_tokens[:code]
        token = %{ token | end: input.position + index + 1 }
        input = %{ input | input: String.slice(input_stream, index + 1..-1),
                           position: input.position + index + 1,
                           tokens: [token | input.tokens],
                           new_line: false,
                           open_tokens: Map.delete(input.open_tokens, :code) }
        next(input)
    end
  end

  def read_code_block(%{input: input_stream} = input) do
    case Regex.run(~r/\`\`\`/, input_stream, return: :index) do
      nil ->
        input = %{input | open_tokens: Map.delete(input.open_tokens, :code_block) }
        next(input)
      [{index, _length}] ->
        token = input.open_tokens[:code_block]
        token = %{ token | end: input.position + index + 3 }
        input = %{ input | input: String.slice(input_stream, index + 3..-1),
                           position: input.position + index + 3,
                           tokens: [token | input.tokens],
                           new_line: false,
                           open_tokens: Map.delete(input.open_tokens, :code_block) }
        next(input)
    end
  end

  def read_mention(%{input: input_stream} = input) do
    case read_user_id(input_stream, {input.position, ""}) do
      {:end, rest, pos, acc} ->
        token = input.open_tokens[:mention]
        token = Map.merge(token, %{end: pos, id: String.to_integer(acc)})
        input = %{ input | input: rest,
                            position: pos,
                            tokens: [token | input.tokens],
                            new_line: false,
                            open_tokens: Map.delete(input.open_tokens, :mention) }
        next(input)
      {:cancel, rest, pos, nil} ->
        input = %{ input | input: rest,
                           position: pos + 1,
                           new_line: false }
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
