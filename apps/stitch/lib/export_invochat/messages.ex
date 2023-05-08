defmodule Stitch.ExportInvochat.Messages do
  alias Stitch.{
    Repo,
    Accounts.User,
    Group,
    GroupUser,
    Message,
    Team
  }

  alias Stitch.ExportInvochat.Request

  import Ecto.Query

  def get_channel_messages(channel_id) do
    from(
      m in Message,
      where: m.group_id == ^channel_id,
      where: m.deleted == false
    )
    |> Repo.all()
  end

  def channels_messages_with_reactions(channel_ids, users_ids) do
    channel_ids
    |> Task.async_stream(&post_messagees(&1, users_ids),
      timeout: :infinity
    )
    |> Enum.map(fn {:ok, result} -> result end)
    |> Enum.reduce(%{}, fn map, acc ->
      Map.merge(acc, map)
    end)
  end

  def post_messagees({channel_id, invo_channel_id}, users_ids) do
    channel_id = String.to_integer(channel_id)
    all_messages = get_channel_messages(channel_id)

    parent_messages = all_messages |> Enum.filter(fn x -> is_nil(x.parent_message_id) end)
    thread_messages = all_messages |> Enum.filter(fn x -> not is_nil(x.parent_message_id) end)

    parent_message_ids = post_messages_reaction(invo_channel_id, parent_messages, users_ids)

    thread_message_ids =
      thread_reactions(invo_channel_id, thread_messages, users_ids, parent_message_ids)

    Map.merge(parent_message_ids, thread_message_ids)
  end

  def post_messages_reaction(_invo_channel_id, [], _users_ids), do: %{}
  def post_messages_reaction(invo_channel_id, messages, users_ids) do
    messages
    |> Enum.map(fn message ->
      url = "/PostMessage"

      body = %{
        "user_id" => get_invo_user_id(message.user_id, users_ids),
        "channel_id" => invo_channel_id,
        "text" => message.text_content,
        "type" => "",
        "root_id" => "",
        "file_name" => [""],
        "file_ids" => [""],
        "pending_post_id" => "",
        "create_at" => parse_timestamp(message.inserted_at)
      }

      post_id = Request.post_api(url, body)["id"]
      reactions(message.reactions, users_ids, post_id)
      %{"#{message.id}" => post_id}
    end)
    |> Enum.reduce(%{}, fn map, acc ->
      Map.merge(acc, map)
    end)
  end
  def thread_reactions(_invo_channel_id, [], _users_ids, _messages_ids), do: %{}
  def thread_reactions(invo_channel_id, messages, users_ids, messages_ids) do
    messages
    |> Enum.map(fn message ->
      url = "/PostMessage"

      body = %{
        "user_id" => get_invo_user_id(message.user_id, users_ids),
        "channel_id" => invo_channel_id,
        "text" => message.text_content,
        "type" => "",
        "root_id" => get_invo_user_id(messages.parent_message_id, messages_ids),
        "file_name" => [""],
        "file_ids" => [""],
        "pending_post_id" => "",
        "create_at" => parse_timestamp(message.inserted_at)
      }
      post_id = Request.post_api(url, body)["id"]
      message.reactions
      reactions(message.reactions, users_ids, post_id)
      %{"#{message.id}" => post_id}
    end)
    |> Enum.reduce(%{}, fn map, acc ->
      Map.merge(acc, map)
    end)
  end

  #def reactions(%{}, _users, _post_id), do: :skip

  def reactions(reactions, users, post_id) do
    reactions
    |> Enum.map(fn {id, reactns} ->
      id = get_invo_user_id(String.to_integer(id), users)
      hit_reaction(reactns, id, post_id)
    end)
  end

  def hit_reaction(reactions, userid, post_id) do
    reactions
    |> Enum.map(fn reaction ->
      name = replace(reaction)

      url = "/v4/reactions"

      body = %{
        "emoji_name" => name,
        "post_id" => post_id,
        "user_id" => userid
      }

      Request.post_api(url, body)
    end)
  end

  def parse_timestamp(naive) do
    datetime =
      naive
      |> NaiveDateTime.to_string()
      |> NaiveDateTime.from_iso8601!()
      |> DateTime.from_naive!("Etc/UTC")
      |> DateTime.to_unix()

    datetime * 1000
  end

  defp get_invo_user_id(id, users) do
    Map.get(users, "#{id}")
  end

  def replace(string), do: String.replace(string, ":", "")
end
