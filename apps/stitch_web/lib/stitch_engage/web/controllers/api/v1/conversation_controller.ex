defmodule StitchEngage.Web.Api.V1.ConversationController do
  use Stitch.Web, :controller
  use Stitch.Web.Api.V1.ConversationDocs

  alias Stitch.{
    Repo,
    Message.Reaction,
    Engage.Inbox,
    Engage.InboxAuthorization,
    Engage.Conversation,
    Engage.ConversationQueries,
    Engage.ConversationAuthorization
  }

  alias StitchEngage.Web.InboxChannel

  action_fallback(Stitch.Web.Api.FallbackController)

  # =========
  #   INDEX
  # =========

  def index(conn, params) do
    do_index(conn, params, conn.assigns.current_user, "index.json")
  end

  def patient_index(conn, params) do
    do_index(conn, params, conn.assigns.patient, "patient_index.json")
  end

  defp do_index(conn, params = %{"inbox_id" => inbox_id}, user_or_patient, json_name) do
    with {:inbox, inbox} when not is_nil(inbox) <- {:inbox, Repo.get(Inbox, inbox_id)},
         {:authorized?, true} <-
           {:authorized?, InboxAuthorization.can_view?(inbox, user_or_patient)} do
      conversations = ConversationQueries.for_index(user_or_patient, inbox.id, params)
      render(conn, json_name, conversations: conversations)
    else
      {:inbox, _} -> {:error, :not_found, "Inbox not found"}
      {:authorized?, _} -> {:error, :unauthorized, "You cannot view conversations in this inbox."}
    end
  end

  # ========
  #   SHOW
  # ========

  def show(conn, params) do
    do_show(conn, params, conn.assigns.current_user, "show.json")
  end

  def patient_show(conn, params) do
    do_show(conn, params, conn.assigns.patient, "patient_show.json")
  end

  defp do_show(conn, %{"id" => id}, user_or_patient, json_name) do
    with {:conversation, conversation} when not is_nil(conversation) <-
           {:conversation, ConversationQueries.for_show(id, user_or_patient)},
         {:authorized?, true} <-
           {:authorized?, ConversationAuthorization.can_view?(conversation, user_or_patient)} do
      conversation = conversation_with_show_data(conversation, user_or_patient)
      render(conn, json_name, conversation: conversation)
    else
      {:conversation, _} ->
        {:error, :not_found, "Conversation not found"}

      {:authorized?, _} ->
        {:error, :unauthorized, "You cannot view this conversation."}
    end
  end

  # ==========
  #   CREATE
  # ==========

  def create(conn, params = %{"inbox_id" => inbox_id}) do
    user = conn.assigns.current_user

    with {:inbox, inbox} when not is_nil(inbox) <- {:inbox, Repo.get(Inbox, inbox_id)},
         {:authorized?, true} <- {:authorized?, InboxAuthorization.can_view?(inbox, user)},
         {:ok, %{conversation: conversation, conversation_message: conversation_message}} <-
           Conversation.begin_conversation_as_provider(user, params) do
      conversation_message = Repo.preload(conversation_message, [:patient, :provider])
      conversation = conversation_with_show_data(conversation, user, [conversation_message])

      InboxChannel.broadcast_conversation_creation(conversation)
      # EventChannel.broadcast_conversation_creation_to_patient(patient_id)

      render(conn, "show.json", conversation: conversation)
    else
      any -> handle_create_with(any)
    end
  end

  def patient_create(conn, params = %{"inbox_id" => inbox_id}) do
    patient = conn.assigns.patient

    with {:inbox, inbox} when not is_nil(inbox) <- {:inbox, Repo.get(Inbox, inbox_id)},
         {:authorized?, true} <- {:authorized?, InboxAuthorization.can_view?(inbox, patient)},
         {:ok, %{conversation: conversation, conversation_message: conversation_message}} <-
           Conversation.begin_conversation_as_patient(patient, params) do
      conversation_message = Repo.preload(conversation_message, [:patient, :provider])
      conversation = conversation_with_show_data(conversation, patient, [conversation_message])

      InboxChannel.broadcast_conversation_creation(conversation)
      # EventChannel.broadcast_conversation_creation_to_patient(patient_id)

      render(conn, "patient_show.json", conversation: conversation)
    else
      any -> handle_create_with(any)
    end
  end

  defp handle_create_with({:inbox, _}), do: {:error, :not_found}

  defp handle_create_with({:authorized?, _}) do
    {:error, :unauthorized, "You cannot create conversations in this inbox."}
  end

  defp handle_create_with({:error, _model_errored, changeset, _}) do
    {:error, :unprocessable_entity, changeset_errors_to_string(changeset)}
  end

  defp handle_create_with(_) do
    {:error, :unprocessable_entity, "There was a problem creating this conversation."}
  end

  # ==============
  #   OPEN/CLOSE
  # ==============

  def open(conn, params) do
    change_open(conn, params, true)
  end

  def close(conn, params) do
    change_open(conn, params, false)
  end

  defp change_open(conn, %{"id" => id}, open_value) do
    user = conn.assigns.current_user

    with {:conversation, conversation} when not is_nil(conversation) <-
           {:conversation, Repo.get(Conversation, id)},
         {:authorized?, true} <-
           {:authorized?, ConversationAuthorization.can_update?(conversation, user)},
         {:ok, updated_conversation} <- Conversation.update_open_value(conversation, open_value) do
      updated_conversation = conversation_with_show_data(updated_conversation, user)

      InboxChannel.broadcast_conversation_update(updated_conversation)
      render(conn, "show.json", conversation: updated_conversation)
    else
      {:conversation, _} ->
        {:error, :not_found}

      {:authorized?, false} ->
        {:error, :not_authorized, "You cannot update this conversation."}

      {:error, :same_open_value} ->
        open_text = if open_value, do: "open", else: "closed."
        {:error, :unprocessable_entity, "Conversation already #{open_text}"}

      {:error, changeset} ->
        {:error, :unprocessable_entity, changeset_errors_to_string(changeset)}

      _error ->
        {:error, :unprocessable_entity}
    end
  end

  defp conversation_with_show_data(
         conversation,
         user_or_patient,
         given_conversation_messages \\ nil
       ) do
    conversation =
      conversation
      |> Repo.preload([:conversation_messages, :patients, :providers])
      |> ConversationQueries.with_unread(user_or_patient)

    conversation_messages =
      Reaction.apply_reactions(
        given_conversation_messages || conversation.conversation_messages,
        :conversation_message
      )

    latest_message = Enum.max_by(conversation_messages, fn cm -> cm.inserted_at end)
    latest_message = ConversationQueries.load_message_info(latest_message)

    %{
      conversation
      | latest_conversation_message: latest_message,
        conversation_messages: conversation_messages
    }
  end
end
