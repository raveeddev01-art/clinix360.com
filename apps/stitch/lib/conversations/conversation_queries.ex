defmodule Stitch.Engage.ConversationQueries do
  @moduledoc """
  Queries used for Conversation and conversation-related logic.
  """

  import Ecto.Query

  alias Stitch.{
    Engage.Conversation,
    Engage.ConversationMessage,
    Engage.ConversationProvider,
    Engage.ConversationPatient,
    Message.Reaction,
    Patient,
    Accounts.User,
    Repo,
    Paginator
  }

  @doc """
  Given a user, inbox and (potentially nil) updated_before and is_open values,
  load the list of conversations for the inbox and any necessary relationships.

  Given a patient, inbox and (potentially nil) updated_before value,
  load the list of conversations for the inbox and any necessary relationships.
  """
  @spec for_index(User.t() | Patient.t(), integer, map) :: list(Conversation.t())
  def for_index(%User{} = user, inbox_id, params = %{}) do
    is_open = Map.get(params, "open", nil)
    updated_before = Map.get(params, "updated_before", nil)

    limit = parse_limit(Map.get(params, "limit"), :conversation)

    Conversation
    |> where(inbox_id: ^inbox_id)
    |> with_open_value(is_open)
    |> updated_before(updated_before)
    |> most_recent(limit)
    |> with_patients()
    |> Repo.all()
    |> with_latest_message_for_each()
    |> with_unread_for_each(user)
  end

  def for_index(%Patient{id: patient_id} = patient, inbox_id, params = %{}) do
    updated_before = Map.get(params, "updated_before", nil)
    limit = parse_limit(Map.get(params, "limit"), :conversation)

    Conversation
    |> where(inbox_id: ^inbox_id)
    |> for_patient(patient_id)
    |> updated_before(updated_before)
    |> most_recent(limit)
    |> Repo.all()
    |> with_latest_message_for_each()
    |> with_unread_for_each(patient)
  end

  @doc """
  Given a patient, return a list of latest conversation messages where the patient is a member
  """
  def with_patient(%Patient{} = patient, options = %{}) do
    limit = Enum.min([options[:limit], 60])
    offset = options[:skip] || 0

    latest_conversation_message_query =
      ConversationMessage
      |> distinct([cm], cm.conversation_id)
      |> order_by([cm], desc: cm.updated_at)

    Conversation
    |> join(
      :inner,
      [c],
      cp in ConversationPatient,
      cp.patient_id == ^patient.id and c.id == cp.conversation_id
    )
    |> order_by([c, cp], desc: c.updated_at)
    |> preload(latest_conversation_message: ^latest_conversation_message_query)
    |> Paginator.new(limit: limit, skip: offset)
  end

  @doc """
  Given a user, inbox id, load a page of open conversations, most_recent message
  for each of the conversations and patients in each conversation
  """
  @spec latest_open_for_inbox(User.t(), integer | binary) :: list(Conversation.t())
  def latest_open_for_inbox(user, inbox_id) do
    Conversation
    |> where(inbox_id: ^inbox_id)
    |> where(open: true)
    |> most_recent(Conversation.page_length())
    |> with_patients()
    |> Repo.all()
    |> with_latest_message_for_each()
    |> with_unread_for_each(user)
  end

  @doc """
  Given a patient & inbox_id, load a page of open conversations, most_recent message for each of the conversations
  """
  @spec latest_for_patient(Patient.t(), integer | binary) :: list(Conversation.t())
  def latest_for_patient(%Patient{id: patient_id} = patient, inbox_id) do
    Conversation
    |> where(inbox_id: ^inbox_id)
    |> for_patient(patient_id)
    |> most_recent(Conversation.page_length())
    |> preload([:patients, :providers])
    |> Repo.all()
    |> with_latest_message_for_each()
    |> with_unread_for_each(patient)
  end

  @doc """
  Given an inbox id, return the total count of open conversations.
  """
  @spec open_count_for_inbox(integer | binary) :: integer
  def open_count_for_inbox(inbox_id) do
    count_by_open_val(inbox_id, true)
  end

  @doc """
  Given an inbox id, return the total count of closed conversations.
  """
  @spec closed_count_for_inbox(integer | binary) :: integer
  def closed_count_for_inbox(inbox_id) do
    count_by_open_val(inbox_id, false)
  end

  @doc """
  Given a conversation id and user, load the conversation and any necessary relationships
  """
  @spec for_show(integer | binary, User.t() | Patient.t()) :: Conversation.t() | nil
  def for_show(conversation_id, %User{} = user) do
    conversation =
      Conversation
      |> where(id: ^conversation_id)
      |> with_patients()
      |> Repo.one()

    case conversation do
      nil ->
        nil

      conversation ->
        conversation
        |> with_unread(user)
        |> with_latest_messages(ConversationMessage.page_length())
    end
  end

  def for_show(conversation_id, %Patient{} = patient) do
    case get_for_patient(conversation_id, patient) do
      nil ->
        nil

      conversation ->
        conversation
        |> with_latest_messages(ConversationMessage.page_length())

        # TODO: add once patient read/unread is implemented
        # |> with_unread(user)
    end
  end

  @doc """
  Given a conversation id and (potentially nil) updated_before,
  return list of conversation messages (limited to page_length)
  """
  @spec messages_for_conversation(integer | binary, binary | nil, integer) :: list()
  def messages_for_conversation(conversation_id, max_id, limit \\ nil) do
    limit = parse_limit(limit, :conversation_message)

    ConversationMessage
    |> where(conversation_id: ^conversation_id)
    |> before_id(max_id)
    |> most_recent_messages(limit)
    |> preload([:provider, :patient])
    |> Repo.all()
    |> Reaction.apply_reactions(:conversation_message)
  end

  @doc """
  Given a conversation message - preload data needed for show view & force reload.
  """
  @spec load_message_info(ConversationMessage.t()) :: ConversationMessage.t()
  def load_message_info(conversation_message) do
    Repo.preload(conversation_message, [:provider, :patient], force: true)
  end

  @doc """
  Given a conversation and user or patient. Add is_unread value to conversation struct.
  """
  @spec with_unread(Conversation.t(), User.t() | Patient.t()) :: Conversation.t()
  def with_unread(conversation, %User{} = user) do
    is_unread =
      case provider_for_conversation_and_user(conversation.id, user.id) do
        nil -> is_unread_without_join_record(conversation, user)
        conversation_provider -> is_unread_with_join_record(conversation_provider)
      end

    Map.put_new(conversation, :is_unread, is_unread)
  end

  def with_unread(conversation, %Patient{} = patient) do
    is_unread =
      case conversation_patients_for_conversation_and_user(conversation.id, patient.id) do
        nil -> is_unread_without_join_record(conversation, patient)
        conversation_patient -> is_unread_with_join_record(conversation_patient)
      end

    Map.put_new(conversation, :is_unread, is_unread)
  end

  # ===========
  #   PRIVATE
  # ===========

  @spec get_for_patient(binary | integer, Patient.t()) :: Conversation.t() | nil
  defp get_for_patient(conversation_id, %Patient{} = patient) do
    Conversation
    |> where(id: ^conversation_id)
    |> for_patient(patient.id)
    |> Repo.one()
  end

  defp for_patient(query, patient_id) do
    query
    |> join(:inner, [c], p in assoc(c, :patients))
    |> where([c, p], p.id == ^patient_id)
  end

  defp with_unread_for_each(conversations, %User{} = user) do
    # Iterates over conversations and assigns is_unread based on
    # conversation_provider (if exists) and/or user inserted_at value
    conversation_ids = Enum.map(conversations, & &1.id)
    conversation_providers_by_conversation_id = get_conversation_joins(conversation_ids, user)
    Enum.map(conversations, make_add_unread_fn(conversation_providers_by_conversation_id, user))
  end

  defp with_unread_for_each(conversations, %Patient{} = patient) do
    # Iterates over conversations and assigns is_unread based on
    # conversation_patient (if exists) and/or inserted_at value
    conversation_ids = Enum.map(conversations, & &1.id)
    conversation_patients_by_conversation_id = get_conversation_joins(conversation_ids, patient)
    Enum.map(conversations, make_add_unread_fn(conversation_patients_by_conversation_id, patient))
  end

  defp make_add_unread_fn(conversation_join_records, user_or_patient) do
    fn conversation ->
      is_unread =
        case Enum.find(conversation_join_records, &(&1.id == conversation.id)) do
          nil -> is_unread_without_join_record(conversation, user_or_patient)
          conversation_user -> is_unread_with_join_record(conversation_user)
        end

      Map.put_new(conversation, :is_unread, is_unread)
    end
  end

  defp is_unread_with_join_record(conversation_user) do
    conversation_user.unread_messages_count > 0
  end

  defp is_unread_without_join_record(conversation, user) do
    Timex.before?(user.inserted_at, conversation.updated_at)
  end

  defp with_patients(query) do
    query |> preload(:patients)
  end

  defp get_conversation_joins(conversation_ids, %User{id: user_id}) do
    ConversationProvider
    |> where([cp], cp.provider_id == ^user_id)
    |> where([cp], cp.conversation_id in ^conversation_ids)
    |> Repo.all()
  end

  defp get_conversation_joins(conversation_ids, %Patient{id: patient_id}) do
    ConversationPatient
    |> where([cp], cp.patient_id == ^patient_id)
    |> where([cp], cp.conversation_id in ^conversation_ids)
    |> Repo.all()
  end

  defp provider_for_conversation_and_user(conversation_id, user_id) do
    ConversationProvider
    |> where([cp], cp.provider_id == ^user_id)
    |> where([cp], cp.conversation_id == ^conversation_id)
    |> Repo.one()
  end

  defp conversation_patients_for_conversation_and_user(conversation_id, patient_id) do
    ConversationPatient
    |> where([cp], cp.patient_id == ^patient_id)
    |> where([cp], cp.conversation_id == ^conversation_id)
    |> Repo.one()
  end

  defp with_latest_message_for_each(conversations) do
    # TODO: actually get latest for each (in a performat way)
    # This will likelu change significantly, and potentiall be
    # executed before the Repo.all()
    Enum.map(conversations, &inefficiently_get_and_merge_latest_message/1)
  end

  defp inefficiently_get_and_merge_latest_message(conversation) do
    # TODO: this is an awful N+1.
    # I am merging this to unblock the frontend for now.
    # DO NOT ship without this figured out.
    latest_message =
      ConversationMessage
      |> where(conversation_id: ^conversation.id)
      |> order_by(desc: :inserted_at)
      |> limit(1)
      |> preload([:patient, :provider])
      |> Repo.one()

    latest_message =
      case latest_message do
        nil ->
          nil

        latest_message ->
          Reaction.apply_reactions([latest_message], :conversation_message) |> List.first()
      end

    Map.merge(conversation, %{latest_conversation_message: latest_message})
  end

  defp with_latest_messages(%Conversation{id: id} = conversation, message_count) do
    latest_conversation_messages =
      from(
        m in ConversationMessage,
        where: m.conversation_id == ^id,
        order_by: m.inserted_at,
        limit: ^message_count
      )
      |> Repo.all()
      |> Reaction.apply_reactions(:conversation_message)

    Map.merge(conversation, %{conversation_messages: latest_conversation_messages})
  end

  defp count_by_open_val(inbox_id, open_val) do
    query =
      Conversation
      |> where(inbox_id: ^inbox_id)
      |> where(open: ^open_val)

    Repo.one(from(c in query, select: count("*")))
  end

  defp parse_limit(nil, type) do
    default_limit_for_type(type)
  end

  defp parse_limit(given_limit, type) when is_number(given_limit) do
    min(default_limit_for_type(type), given_limit)
  end

  defp parse_limit(given_limit, type) when is_binary(given_limit) do
    case Integer.parse(given_limit) do
      {int_limit, _} -> parse_limit(int_limit, type)
      _ -> default_limit_for_type(type)
    end
  end

  defp default_limit_for_type(:conversation), do: 20
  defp default_limit_for_type(:conversation_message), do: 50

  defp most_recent(query, count) do
    from(m in query, order_by: [desc: m.updated_at], limit: ^count)
  end

  defp most_recent_messages(query, count) do
    from(m in query, order_by: [desc: m.inserted_at], limit: ^count)
  end

  defp with_open_value(query, nil), do: query

  defp with_open_value(query, open_val) do
    query |> where(open: ^open_val)
  end

  defp before_id(query, nil), do: query

  defp before_id(query, max_id) do
    query |> where([m], m.id < ^max_id)
  end

  defp updated_before(query, nil), do: query

  defp updated_before(query, updated_at_limit) do
    with {:parse_ms, {ms, ""}} <- {:parse_ms, Integer.parse("#{updated_at_limit}")},
         {:ok, date_time} <- DateTime.from_unix(ms) do
      from(m in query, where: m.updated_at < ^date_time)
    else
      _ -> query
    end
  end
end
