defmodule Stitch.ReadStatus do
  @moduledoc """
  Holds logic around marking read/unread.

  Currently supports messages but will be used for conversation messages
  once it gets built out.
  """

  import Ecto.Query

  alias Stitch.{
    Repo,
    Accounts.User,
    GroupUser,
    GroupQueries,
    Message
  }

  alias Ecto.Multi

  @spec get_read_status(:message, [User.t()], User.t()) :: {map, [User.t()]}
  def get_read_status(:message, users, author) do
    {read_status, recipients} =
      users
      |> Enum.reduce({%{}, []}, fn recipient, {acc_map, acc_list} ->
        acc_map =
          if recipient.id == author.id or recipient.disabled or recipient.is_bot,
            do: acc_map,
            else: Map.put(acc_map, to_string(recipient.id), nil)

        acc_list = if recipient.id == author.id, do: acc_list, else: [recipient.id | acc_list]
        {acc_map, acc_list}
      end)

    {read_status, recipients}
  end

  @spec mark_as_read(:message, integer, integer) :: {:ok, map} | {:error, binary}
  def mark_as_read(:message, user_id, group_id) do
    if GroupQueries.user_is_member?(group_id, user_id) do
      result =
        Multi.new()
        |> Multi.update_all(
          :mark_messages_as_read,
          mark_messages_as_read(:message, group_id, user_id),
          [],
          returning: true
        )
        |> Multi.update_all(
          :mark_group_as_read,
          mark_group_as_read(:message, group_id, user_id),
          [],
          returning: true
        )
        |> Repo.transaction()

      case result do
        {:ok, %{mark_messages_as_read: {_, messages}}} ->
          message_ids = Enum.map(messages, & &1.id)
          Stitch.Mobile.NotificationQueue.remove_message_ids(user_id, message_ids)
          result

        error ->
          error
      end
    else
      {:error, "User is not part of this room"}
    end
  end

  @spec mark_as_unread(:message, integer, integer, Message.t() | nil) ::
          {:ok, map} | {:error, binary}

  def mark_as_unread(:message, user_id, group_id, %Message{user_id: user_id} = message) do
    if messages_from_other_users(:message, user_id, group_id, message.id) do
      do_mark_as_unread(user_id, group_id, message)
    else
      {:error, "No messages from other users after the target message"}
    end
  end

  def mark_as_unread(:message, _user_id, _group_id, %Message{type: "system"} = _message) do
    {:error, "System message can't be marked as unread"}
  end

  def mark_as_unread(:message, user_id, group_id, nil) do
    group_user = Repo.get_by(GroupUser, user_id: user_id, group_id: group_id)
    {:ok, %{mark_messages_as_unread: {0, []}, mark_group_as_unread: {1, [group_user]}}}
  end

  def mark_as_unread(:message, user_id, group_id, message) do
    do_mark_as_unread(user_id, group_id, message)
  end

  def mark_as_read_on_creation(multi, group_id, user_id, :message) do
    multi
    |> Multi.update_all(
      :mark_messages_as_read,
      mark_messages_as_read(:message, group_id, user_id),
      []
    )
    |> Multi.update_all(:mark_group_as_read, mark_group_as_read(:message, group_id, user_id), [])
  end

  @spec increment_unread_counter(:message, integer, integer) :: Ecto.Query.t()
  def increment_unread_counter(:message, group_id, user_ids) do
    GroupUser
    |> where([gu], gu.group_id == ^group_id)
    |> where([gu], gu.user_id in ^user_ids)
    |> update([gu], inc: [unread_messages_count: ^1], set: [is_hidden: ^false])
  end

  @spec decrement_unread_counter(Message.t()) :: Ecto.Query.t()
  def decrement_unread_counter(%Message{} = message) do
    GroupUser
    |> where([gu], gu.group_id == ^message.group_id)
    |> where([gu], gu.user_id != ^message.user_id)
    |> update(
      [gu],
      set: [unread_messages_count: fragment("greatest(? - 1, 0)", gu.unread_messages_count)]
    )
  end

  # ===========
  #   PRIVATE
  # ===========

  defp do_mark_as_unread(user_id, group_id, %Message{} = message) do
    Multi.new()
    |> Multi.update_all(
      :mark_messages_as_read,
      mark_messages_as_read(:message, group_id, user_id, message.id),
      []
    )
    |> Multi.update_all(
      :mark_messages_as_unread,
      mark_messages_as_unread(:message, group_id, user_id, message.id),
      [],
      returning: true
    )
    |> Multi.update_all(
      :mark_group_as_unread,
      mark_group_as_unread(group_id, user_id, message),
      [],
      returning: true
    )
    |> Repo.transaction()
  end

  defp mark_messages_as_unread(:message, group_id, user_id, message_id) do
    Message
    |> where([m], m.group_id == ^group_id)
    |> where([m], m.id >= ^message_id)
    |> where([m], m.user_id != ^user_id)
    |> where(
      [m],
      fragment(
        "(? \\? ?) and (not (? @> ?))",
        m.read_status,
        ^to_string(user_id),
        m.read_status,
        ^%{to_string(user_id) => nil}
      )
    )
    |> update([m], set: [read_status: fragment("? || ?", m.read_status, ^%{user_id => nil})])
  end

  defp mark_group_as_unread(group_id, user_id, %Message{} = message) do
    %{mentions_count: mentions_count, unread_messages_count: unread_messages_count} =
      count_after(:message, group_id, user_id, message.id)

    GroupUser
    |> where(group_id: ^group_id, user_id: ^user_id)
    |> update(
      [m],
      set: [
        last_read_at: ^message.inserted_at,
        mentions_count: ^mentions_count,
        unread_messages_count: ^unread_messages_count
      ]
    )
  end

  defp mark_messages_as_read(:message, group_id, user_id) do
    group_user = Repo.get_by(GroupUser, group_id: group_id, user_id: user_id)
    last_read_at = group_user.last_read_at || group_user.inserted_at

    Message
    |> where([m], m.group_id == ^group_id)
    |> where([m], m.user_id != ^user_id)
    |> where([m], m.inserted_at >= ^last_read_at)
    |> where([m], fragment("? @> ?", m.read_status, ^%{to_string(user_id) => nil}))
    |> update(
      [m],
      set: [
        read_status: fragment("? || ?", m.read_status, ^%{user_id => NaiveDateTime.utc_now()})
      ]
    )
  end

  defp mark_messages_as_read(:message, group_id, user_id, message_id) do
    mark_messages_as_read(:message, group_id, user_id)
    |> where([m], m.id < ^message_id)
  end

  defp mark_group_as_read(:message, group_id, user_id) do
    GroupUser
    |> where(group_id: ^group_id, user_id: ^user_id)
    |> update(
      [m],
      set: [last_read_at: ^DateTime.utc_now(), mentions_count: 0, unread_messages_count: 0]
    )
  end

  defp messages_from_other_users(:message, user_id, group_id, message_id) do
    Message
    |> where([m], m.group_id == ^group_id)
    |> where([m], m.user_id != ^user_id)
    |> where([m], m.type != "system")
    |> where([m], m.id >= ^message_id)
    |> limit(1)
    |> select([m], %{id: m.id})
    |> Repo.one()
  end

  defp count_after(:message, group_id, user_id, message_id) do
    Message
    |> where([m], m.group_id == ^group_id)
    |> where([m], m.id >= ^message_id)
    |> where([m], m.user_id != ^user_id)
    |> where([m], m.type != "system")
    |> select([m], %{
      mentions_count:
        fragment("coalesce(count (*) filter (where ? @> ?), 0)", m.mentioned_user_ids, ^[user_id]),
      unread_messages_count: count(m.id)
    })
    |> Repo.one()
  end
end
