defmodule Stitch.ReadStatus do
  @moduledoc """
  Holds logic around marking read/unread.

  Handles Message and ConversationMessage logic with similar interface for each.
  """

  import Ecto.Query

  alias Stitch.{
    Repo,
    Accounts.User,
    Patient,
    GroupUser,
    GroupQueries,
    Message,
    Engage.ConversationAuthorization,
    Engage.Conversation,
    Engage.ConversationMessage,
    Engage.ConversationProvider,
    Engage.ConversationPatient
  }

  alias Ecto.Multi

  # GET READ STAUTS

  @spec get_read_status(:message, [User.t()], User.t()) :: {map, [User.t()]}
  def get_read_status(:message, users, author) do
    should_ignore = &(&1.id == author.id or &1.disabled or &1.is_bot)
    do_get_read_status(should_ignore, users, author)
  end

  @spec get_read_status(:conversation_message, [User.t()], User.t()) :: {map, [User.t()]}
  def get_read_status(:conversation_message, providers, author) do
    should_ignore = &(&1.id == author.id or &1.disabled)
    do_get_read_status(should_ignore, providers, author)
  end

  # MARK AS READ

  @spec mark_as_read(:message, integer, integer) :: {:ok, map} | {:error, binary}
  def mark_as_read(:message, user_id, group_id) do
    if GroupQueries.user_is_member?(group_id, user_id) do
      result =
        Multi.new()
        |> Multi.update_all(
          :mark_messages_as_read,
          mark_message_list_as_read(:message, group_id, user_id),
          [],
          returning: true
        )
        |> Multi.update_all(
          :mark_group_as_read,
          mark_parent_as_read(:message, group_id, user_id),
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

  @spec mark_as_read(:conversation_message, Conversation.t(), User.t()) ::
          {:ok, map} | {:error, binary}
  def mark_as_read(:conversation_message, %Conversation{} = conversation, %User{} = user) do
    # This differs logically from above due to possible join record creation (insert_or_update)
    with true <- ConversationAuthorization.can_view?(conversation, user),
         {:ok, _conversation_provider} <-
           ConversationProvider.insert_or_update(conversation, user) do
      Multi.new()
      |> multi_mark_list_as_read(:conversation_message_provider, conversation.id, user.id)
      |> multi_mark_conversation_as_read(
        :conversation_message_provider,
        conversation.id,
        user.id
      )
      |> Repo.transaction()
      |> handle_mark_as_read_multi()
    else
      _error -> {:error, "User is not part of this conversation"}
    end
  end

  @spec mark_as_read(:conversation_message, Conversation.t(), Patient.t()) ::
          {:ok, map} | {:error, binary}
  def mark_as_read(:conversation_message, %Conversation{} = conversation, %Patient{} = patient) do
    if ConversationAuthorization.can_view?(conversation, patient) do
      Multi.new()
      |> multi_mark_list_as_read(:conversation_message_patient, conversation.id, patient.id)
      |> multi_mark_conversation_as_read(
        :conversation_message_patient,
        conversation.id,
        patient.id
      )
      |> Repo.transaction()
      |> handle_mark_as_read_multi()
    else
      {:error, "Patient is not part of this conversation"}
    end
  end

  defp multi_mark_list_as_read(multi_query, type, conversation_id, user_or_patient_id) do
    Multi.update_all(
      multi_query,
      :mark_conversation_messages_as_read,
      mark_message_list_as_read(type, conversation_id, user_or_patient_id),
      [],
      returning: true
    )
  end

  defp multi_mark_conversation_as_read(multi_query, type, conversation_id, user_or_patient_id) do
    Multi.update_all(
      multi_query,
      :mark_conversation_as_read,
      mark_parent_as_read(type, conversation_id, user_or_patient_id),
      [],
      returning: true
    )
  end

  defp handle_mark_as_read_multi(result) do
    case result do
      {:ok, %{mark_conversation_messages_as_read: {_, _conversation_messages}}} ->
        # Notifications: update mobile notifications here
        result

      error ->
        error
    end
  end

  # MARK AS UNREAD

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

  def mark_as_unread(:message, user_id, group_id, %Message{} = message) do
    do_mark_as_unread(user_id, group_id, message)
  end

  @spec mark_as_unread(
          :conversation_message,
          User.t(),
          Conversatiom.t(),
          ConversationMessage.t() | nil
        ) :: {:ok, map} | {:error, binary}

  def mark_as_unread(
        :conversation_message,
        %User{id: provider_id} = provider,
        %Conversation{} = conversation,
        %ConversationMessage{provider_id: provider_id} = conversation_message
      ) do
    if messages_from_other_users(
         :conversation_message_provider,
         provider.id,
         conversation.id,
         conversation_message.id
       ) do
      do_mark_as_unread(provider, conversation, conversation_message)
    else
      {:error, "No messages from other users after the target message"}
    end
  end

  def mark_as_unread(:conversation_message, %User{} = provider, conversation, nil) do
    conversation_provider =
      Repo.get_by(
        ConversationProvider,
        provider_id: provider.id,
        conversation_id: conversation.id
      )

    {:ok,
     %{
       mark_conversation_messages_as_unread: {0, []},
       mark_conversation_as_unread: {1, [conversation_provider]}
     }}
  end

  def mark_as_unread(
        :conversation_message,
        %User{} = provider,
        %Conversation{} = conversation,
        %ConversationMessage{} = conversation_message
      ) do
    do_mark_as_unread(provider, conversation, conversation_message)
  end

  # MARK AS READ ON CREATION

  def mark_as_read_on_creation(multi, group_id, user_id, :message) do
    multi
    |> Multi.update_all(
      :mark_messages_as_read,
      mark_message_list_as_read(:message, group_id, user_id),
      []
    )
    |> Multi.update_all(:mark_group_as_read, mark_parent_as_read(:message, group_id, user_id), [])
  end

  def mark_as_read_on_creation(multi, conversation, %User{} = sender, :conversation_message) do
    ConversationProvider.insert_or_update(conversation, sender)

    multi
    |> Multi.update_all(
      :mark_conversation_messages_as_read,
      mark_message_list_as_read(:conversation_message_provider, conversation.id, sender.id),
      []
    )
    |> Multi.update_all(
      :mark_conversation_as_read,
      mark_parent_as_read(:conversation_message_provider, conversation.id, sender.id),
      []
    )
  end

  def mark_as_read_on_creation(multi, conversation, %Patient{} = sender, :conversation_message) do
    multi
    |> Multi.update_all(
      :mark_conversation_messages_as_read,
      mark_message_list_as_read(:conversation_message_patient, conversation.id, sender.id),
      []
    )
    |> Multi.update_all(
      :mark_conversation_as_read,
      mark_parent_as_read(:conversation_message_patient, conversation.id, sender.id),
      []
    )
  end

  # INCREMENT UNREAD COUNTER

  @spec increment_unread_counter(
          :message | :conversation_message_provider | :conversation_message_patient,
          integer,
          list(integer)
        ) :: Ecto.Query.t()

  def increment_unread_counter(:message, group_id, user_ids) do
    GroupUser
    |> where([gu], gu.group_id == ^group_id)
    |> where([gu], gu.user_id in ^user_ids)
    |> update([gu], inc: [unread_messages_count: ^1], set: [is_hidden: ^false])
  end

  def increment_unread_counter(:conversation_message_provider, conversation_id, provider_ids) do
    ConversationProvider
    |> where([cp], cp.conversation_id == ^conversation_id)
    |> where([cp], cp.provider_id in ^provider_ids)
    |> update([cp], inc: [unread_messages_count: ^1])
  end

  def increment_unread_counter(:conversation_message_patient, conversation_id, patient_ids) do
    ConversationPatient
    |> where([cp], cp.conversation_id == ^conversation_id)
    |> where([cp], cp.patient_id in ^patient_ids)
    |> update([cp], inc: [unread_messages_count: ^1])
  end

  # DECREMENT UNREAD COUNTER

  @spec decrement_unread_counter(Message.t() | ConversationMessage.t(), atom) :: Ecto.Query.t()
  def decrement_unread_counter(%Message{} = message) do
    GroupUser
    |> where([gu], gu.group_id == ^message.group_id)
    |> where([gu], gu.user_id != ^message.user_id)
    |> decrement_unread()
  end

  def decrement_unread_counter(%ConversationMessage{} = conversation_message, :provider) do
    query =
      where(
        ConversationProvider,
        [cp],
        cp.conversation_id == ^conversation_message.conversation_id
      )

    case conversation_message.provider_id do
      nil ->
        # if conversation_message not from a provider, don't
        # add unnecessary where (that handles nil poorly)
        decrement_unread(query)

      provider_id ->
        query
        |> where([cp], cp.provider_id != ^provider_id)
        |> decrement_unread()
    end
  end

  def decrement_unread_counter(
        %ConversationMessage{} = conversation_message,
        :patient
      ) do
    query =
      where(
        ConversationPatient,
        [cp],
        cp.conversation_id == ^conversation_message.conversation_id
      )

    case conversation_message.patient_id do
      nil ->
        # if conversation_message not from a patient, don't
        # add unnecessary where (that handles nil poorly)
        decrement_unread(query)

      patient_id ->
        query
        |> where([cp], cp.patient_id != ^patient_id)
        |> decrement_unread()
    end
  end

  defp decrement_unread(query) do
    update(
      query,
      [t],
      set: [
        unread_messages_count: fragment("greatest(? - 1, 0)", t.unread_messages_count)
      ]
    )
  end

  # ===========
  #   PRIVATE
  # ===========

  # GET READ STATUS HELPER

  defp do_get_read_status(should_ignore, users, author) do
    users
    |> Enum.reduce({%{}, []}, fn recipient, {read_status, recipients} ->
      read_status =
        if should_ignore.(recipient),
          do: read_status,
          else: Map.put(read_status, to_string(recipient.id), nil)

      recipients = if recipient.id == author.id, do: recipients, else: [recipient.id | recipients]
      {read_status, recipients}
    end)
  end

  # DO MARK AS UNREAD

  defp do_mark_as_unread(user_id, group_id, %Message{} = message) do
    Multi.new()
    |> Multi.update_all(
      :mark_messages_as_read,
      mark_message_list_as_read(:message, group_id, user_id, message.id),
      []
    )
    |> Multi.update_all(
      :mark_messages_as_unread,
      mark_message_list_as_unread(:message, group_id, user_id, message.id),
      [],
      returning: true
    )
    |> Multi.update_all(
      :mark_group_as_unread,
      mark_parent_as_unread(:message, group_id, user_id, message),
      [],
      returning: true
    )
    |> Repo.transaction()
  end

  defp do_mark_as_unread(
         %User{} = provider,
         %Conversation{} = conversation,
         %ConversationMessage{} = conversation_message
       ) do
    with true <- ConversationAuthorization.can_view?(conversation, provider),
         {:ok, _conversation_provider} <-
           ConversationProvider.insert_or_update(conversation, provider) do
      Multi.new()
      |> Multi.update_all(
        :mark_messages_as_read,
        mark_message_list_as_read(
          :conversation_message_provider,
          conversation.id,
          provider.id,
          conversation_message.id
        ),
        []
      )
      |> Multi.update_all(
        :mark_messages_as_unread,
        mark_message_list_as_unread(
          :conversation_message_provider,
          conversation.id,
          provider.id,
          conversation_message.id
        ),
        [],
        returning: true
      )
      |> Multi.update_all(
        :mark_conversation_as_unread,
        mark_parent_as_unread(
          :conversation_message_provider,
          conversation.id,
          provider.id,
          conversation_message
        ),
        [],
        returning: true
      )
      |> Repo.transaction()
    else
      _error ->
        {:error, "User is not part of this conversation"}
    end
  end

  # MARK PARENT AS UNREAD

  defp mark_parent_as_unread(:message, group_id, user_id, %Message{} = message) do
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

  defp mark_parent_as_unread(
         :conversation_message_provider,
         conversation_id,
         provider_id,
         %ConversationMessage{} = conversation_message
       ) do
    %{unread_messages_count: unread_messages_count} =
      count_after(
        :conversation_message_provider,
        conversation_id,
        provider_id,
        conversation_message.id
      )

    ConversationProvider
    |> where(conversation_id: ^conversation_id, provider_id: ^provider_id)
    |> update(
      [m],
      set: [
        last_read_at: ^conversation_message.inserted_at,
        unread_messages_count: ^unread_messages_count
      ]
    )
  end

  # MARK MESSAGES AS READ

  defp mark_message_list_as_read(:message, group_id, user_id) do
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

  defp mark_message_list_as_read(:conversation_message_provider, conversation_id, provider_id) do
    conversation_user =
      Repo.get_by(
        ConversationProvider,
        conversation_id: conversation_id,
        provider_id: provider_id
      )

    last_read_at = conversation_user.last_read_at || conversation_user.inserted_at

    query =
      ConversationMessage
      |> where([cm], cm.conversation_id == ^conversation_id)
      |> where([cm], cm.provider_id != ^provider_id)
      |> where([cm], cm.inserted_at >= ^last_read_at)
      |> where(
        [cm],
        fragment(
          "? @> ? or (not ? \\? ?)",
          cm.provider_read_status,
          ^%{to_string(provider_id) => nil},
          cm.provider_read_status,
          ^to_string(provider_id)
        )
      )

    query
    |> update(
      [cm],
      set: [
        provider_read_status:
          fragment("? || ?", cm.provider_read_status, ^%{provider_id => NaiveDateTime.utc_now()})
      ]
    )
  end

  defp mark_message_list_as_read(:conversation_message_patient, conversation_id, patient_id) do
    conversation_user =
      Repo.get_by(
        ConversationPatient,
        conversation_id: conversation_id,
        patient_id: patient_id
      )

    last_read_at = conversation_user.last_read_at || conversation_user.inserted_at

    query =
      ConversationMessage
      |> where([cm], cm.conversation_id == ^conversation_id)
      |> where([cm], is_nil(cm.patient_id) or cm.patient_id != ^patient_id)
      |> where([cm], cm.inserted_at >= ^last_read_at)
      |> where(
        [cm],
        fragment(
          "? @> ? or (not ? \\? ?)",
          cm.patient_read_status,
          ^%{to_string(patient_id) => nil},
          cm.patient_read_status,
          ^to_string(patient_id)
        )
      )

    query
    |> update(
      [cm],
      set: [
        patient_read_status:
          fragment("? || ?", cm.patient_read_status, ^%{patient_id => NaiveDateTime.utc_now()})
      ]
    )
  end

  defp mark_message_list_as_read(message_type, parent_id, user_id, id) do
    mark_message_list_as_read(message_type, parent_id, user_id)
    |> where([t], t.id < ^id)
  end

  # MARK MESSAGES AS UNREAD

  defp mark_message_list_as_unread(:message, group_id, user_id, message_id) do
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

  defp mark_message_list_as_unread(
         :conversation_message_provider,
         conversation_id,
         provider_id,
         conversation_message_id
       ) do
    ConversationMessage
    |> where([cm], cm.conversation_id == ^conversation_id)
    |> where([cm], cm.id >= ^conversation_message_id)
    |> where([cm], cm.provider_id != ^provider_id)
    |> where(
      [cm],
      fragment(
        "(? \\? ?) and (not (? @> ?))",
        cm.provider_read_status,
        ^to_string(provider_id),
        cm.provider_read_status,
        ^%{to_string(provider_id) => nil}
      )
    )
    |> update(
      [cm],
      set: [
        provider_read_status: fragment("? || ?", cm.provider_read_status, ^%{provider_id => nil})
      ]
    )
  end

  # MARK PARENT AS READ

  defp mark_parent_as_read(:message, group_id, user_id) do
    GroupUser
    |> where(group_id: ^group_id, user_id: ^user_id)
    |> update(
      [m],
      set: [last_read_at: ^DateTime.utc_now(), mentions_count: 0, unread_messages_count: 0]
    )
  end

  defp mark_parent_as_read(:conversation_message_provider, conversation_id, user_id) do
    ConversationProvider
    |> where(conversation_id: ^conversation_id, provider_id: ^user_id)
    |> update(
      [m],
      set: [last_read_at: ^DateTime.utc_now(), unread_messages_count: 0]
    )
  end

  # DONE
  defp mark_parent_as_read(:conversation_message_patient, conversation_id, patient_id) do
    ConversationPatient
    |> where(conversation_id: ^conversation_id, patient_id: ^patient_id)
    |> update(
      [m],
      set: [last_read_at: ^DateTime.utc_now(), unread_messages_count: 0]
    )
  end

  # MESSAGES FROM OTHER USERS

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

  defp messages_from_other_users(
         :conversation_message_provider,
         provider_id,
         conversation_id,
         conversation_message_id
       ) do
    ConversationMessage
    |> where([cm], cm.conversation_id == ^conversation_id)
    |> where([cm], cm.provider_id != ^provider_id)
    |> where([cm], cm.id >= ^conversation_message_id)
    |> limit(1)
    |> select([cm], %{id: cm.id})
    |> Repo.one()
  end

  # COUNT AFTER

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

  defp count_after(
         :conversation_message_provider,
         conversation_id,
         provider_id,
         conversation_message_id
       ) do
    ConversationMessage
    |> where([cm], cm.conversation_id == ^conversation_id)
    |> where([cm], cm.id >= ^conversation_message_id)
    |> where([cm], cm.provider_id != ^provider_id)
    |> select([cm], %{
      unread_messages_count: count(cm.id)
    })
    |> Repo.one()
  end
end
