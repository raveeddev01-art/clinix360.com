defmodule Stitch.MeteorMigration.Message do
  alias Stitch.Message
  alias Stitch.Repo
  require Logger

  @chunk_size 200

  def migrate_messages(messages) do
    Repo.insert_all(Message, messages, returning: false)
  end

  def parse_messages_json(rooms, users, messages) do
    messages
    |> Enum.map(& parse_message_json(rooms, users, &1))
    |> Enum.filter(& &1 != nil)
  end

  def parse_message_json(_rooms, _users, %{"msg"=> ""}) do
    nil
  end

  @doc """
  `rooms` must a map with meteor's room id as a key and pheonix group struct as a value
  """
  def parse_message_json(rooms, users, %{
    "_id" => _meteor_id,
    "msg" => text_content,
    "u" => %{"username" => meteor_creator_username},
    "ts" => timestamp,
    "rid" => meteor_room_id } = attributes) do

    with {:ok, user} <- Map.fetch(users, meteor_creator_username),
         {:ok, group} <- Map.fetch(rooms, meteor_room_id) do

      %{
        text_content: parse_mentions(text_content, users),
        inserted_at: parse_timestamp(timestamp),
        updated_at: parse_timestamp(timestamp),
        user_id: user.id,
        group_id: group.id,
        type: "chat",
      }
    else _error ->
      Logger.error("Error creating message, message: #{inspect(attributes)}.")
      nil
    end
  end

  def parse_mentions(text_content, users) do
    Enum.reduce(users, text_content, fn ({username, user}, acc) ->
      String.replace(acc, "@#{username}", "<@U#{user.id}>")
    end)
  end

  def parse_timestamp(timestmap) do
    NaiveDateTime.from_iso8601!(timestmap) |> DateTime.from_naive!("Etc/UTC")
  end

  def run(rooms, users, message_json_file) do
    message_file_stream(message_json_file, @chunk_size, fn messages, n ->
      parse_messages_json(rooms, users, messages)
      |> migrate_messages

      IO.puts "#{n} messages migrated."
    end)
  end

  def message_file_stream(messages_file, chunk_size, chunk_fn) do
    stream = messages_file |> File.stream!

    chunk_fun = fn line, %{line: line_acc, objects: objects_acc, counter: counter} ->
      if line == "}\n" do
        line_acc = line_acc ++ [line]
        object = parse_object(line_acc)
        objects_acc = [object | objects_acc]
        counter = counter + 1

        if counter >= chunk_size do
          chunk_fn.(objects_acc, counter)
          {:cont, %{line: [], objects: [], counter: 0}}
        else
          {:cont, %{line: [], objects: objects_acc, counter: counter}}
        end
      else
        {:cont, %{line: line_acc ++ [line], objects: objects_acc, counter: counter}}
      end
    end

    after_fun = fn %{line: _line_acc, objects: objects_acc, counter: counter} = acc ->
      chunk_fn.(objects_acc, counter)
      {:cont, acc}
    end

    stream
    |> Stream.chunk_while(%{line: [], objects: [], counter: 0}, chunk_fun, after_fun)
    |> Stream.run
  end

  def parse_object(object) do
    object = object
    |> Enum.map_join(fn line ->
      line = String.replace(line, ~r/NumberInt\(([^)]+)\)/, "\\1")
      line = String.replace(line, ~r/ISODate\(([^)]+)\)/, "\\1")
      line
    end)
    object |> Poison.decode!
  end
end