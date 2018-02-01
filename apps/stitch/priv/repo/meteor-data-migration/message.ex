defmodule Stitch.MeteorMigration.Message do
  alias Stitch.Message
  alias Stitch.Repo
  require Logger

  @chunk_size 300
  @meteor_migration_debug System.get_env("METEOR_MIGRATION_DEBUG") == "true"

  def migrate_messages(messages) do
    inserted_count =
      messages
      |> Enum.reduce(0, fn (message, acc) ->
        if Repo.get_by(Message, meteor_id: message.meteor_id) == nil do
          attrs = %Message{
            text_content: message.text_content,
            inserted_at: message.inserted_at,
            updated_at: message.updated_at,
            user_id: message.user_id,
            group_id: message.group_id,
            type: "chat",
            meteor_id: message.meteor_id,
          }

          case Repo.insert(attrs) do
            {:ok, _} -> acc + 1
            _ -> 0
          end
        else
          0
        end
      end)

    IO.puts "#{inserted_count} messages inserted."
  end

  def parse_messages_json(rooms, phoenix_users_by_email, meteor_users_by_username, messages) do
    messages
    |> Enum.map(& parse_message_json(rooms, phoenix_users_by_email, meteor_users_by_username, &1))
    |> Enum.filter(& &1 != nil)
  end

  @doc """
  Given username in meteor app,
  - fetch the corresponding meteor user and get his email
  - fetch phoenix user struct by email
  """
  def fetch_user_via_email(phoenix_users_by_email, meteor_users_by_username, username) do
    with {:ok, meteor_user} <- Map.fetch(meteor_users_by_username, username),
         {:ok, phoenix_user} <- Map.fetch(phoenix_users_by_email, meteor_user.email) do
      {:ok, phoenix_user}
    end
  end

  def parse_message_json(_rooms, _phoenix_users_by_email, _meteor_users_by_username, %{"msg"=> ""}) do
    nil
  end

  @doc """
  `rooms` must a map with meteor's room id as a key and pheonix group struct as a value
  """
  def parse_message_json(rooms, phoenix_users_by_email, meteor_users_by_username, %{
    "_id" => meteor_id,
    "msg" => text_content,
    "u" => %{"_id" => meteor_creator_id},
    "ts" => timestamp,
    "rid" => meteor_room_id } = attributes) do

    with {:ok, user} <- fetch_user_via_email(phoenix_users_by_email, meteor_users_by_username, meteor_creator_id),
         {:ok, group} <- Map.fetch(rooms, meteor_room_id) do

      %{
        text_content: text_content,
        inserted_at: parse_timestamp(timestamp),
        updated_at: parse_timestamp(timestamp),
        user_id: user.id,
        group_id: group.id,
        type: "chat",
        meteor_id: meteor_id,
      }
    else _error ->
      if @meteor_migration_debug do
        IO.puts("Error creating message, message: #{inspect(attributes)}.")
      end
      nil
    end
  end

  # def parse_mentions(text_content, phoenix_users_by_email, meteor_users_by_username) do
  #   Enum.reduce(meteor_users_by_username, text_content, fn ({username, user}, acc) ->
  #     case fetch_user_via_email(phoenix_users_by_email, meteor_users_by_username, username) do
  #       {:ok, user} ->
  #         String.replace(acc, "@#{username}", "<@U#{user.id}>")
  #       :error ->
  #         acc
  #     end
  #   end)
  # end

  def parse_timestamp(timestmap) do
    NaiveDateTime.from_iso8601!(timestmap) |> DateTime.from_naive!("Etc/UTC")
  end

  def run(rooms, phoenix_users_by_email, meteor_users_by_username, message_json_file) do
    message_file_stream(message_json_file, @chunk_size, fn messages, n ->
      if @meteor_migration_debug, do: IO.puts "#{n} messages parsed."

      parse_messages_json(rooms, phoenix_users_by_email, meteor_users_by_username, messages)
      |> migrate_messages
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