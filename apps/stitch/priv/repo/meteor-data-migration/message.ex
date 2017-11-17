defmodule Stitch.MeteorMigration.Message do
  alias Stitch.Message
  alias Stitch.Repo
  require Logger

  def migrate_messages(messages) do
    Repo.insert_all(Message, messages, returning: false)
  end

  def parse_messages_json(rooms, users, messages) do
    messages
    |> Enum.sort_by(fn message ->
      message["ts"] |> parse_timestamp
    end)
    |> Enum.map(& parse_message_json(rooms, users, &1))
    |> Enum.filter(& &1 != nil)
  end

  def parse_message_json(rooms, users, %{
    "_id" => meteor_id,
    "msg" => text_content,
    "u" => %{"username" => meteor_creator_username},
    "ts" => timestamp,
    "rid" => meteor_room_id } = attributes) do

    with {:ok, user} <- Map.fetch(users, meteor_creator_username),
         {:ok, group} <- Map.fetch(rooms, meteor_room_id) do

      %{
        text_content: text_content,
        inserted_at: parse_timestamp(timestamp),
        updated_at: parse_timestamp(timestamp),
        user_id: user.id,
        group_id: group.id,
        type: "chat",
      }
    else error ->
      Logger.error("Error creating message, message: #{inspect(attributes)}.")
      nil
    end
  end

  def parse_timestamp(timestmap) do
    NaiveDateTime.from_iso8601!(timestmap) |> DateTime.from_naive!("Etc/UTC")
  end
end

# {
#   "_id" : "00QW9fTgHOi2UZqEt",
#   "msg" : "This feels pretty slow",
#   "rids" : [
#       "c_HhXg3vmotoWZRE5z2HhXg3vmotoWZRE5z2",
#       "c_rNhg5Xa7pHTEZSqhu"
#   ],
#   "rid" : "c_HhXg3vmotoWZRE5z2HhXg3vmotoWZRE5z2",
#   "ts" : ISODate("2016-11-03T15:28:50.154+0000"),
#   "u" : {
#       "_id" : "HhXg3vmotoWZRE5z2",
#       "username" : "ellen",
#       "displayName" : "Ellen Clark"
#   },
#   "mentions" : [

#   ],
#   "channels" : [

#   ],
#   "teamId" : "8J2CSuBwCmop7PQmh"
# }
# {