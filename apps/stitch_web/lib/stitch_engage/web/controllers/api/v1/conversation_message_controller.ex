defmodule StitchEngage.Web.Api.V1.ConversationMessageController do
  use Stitch.Web, :controller
  use Stitch.Web.Api.V1.ConversationMessageDocs

  alias Stitch.{
    Repo,
    Patient,
    Accounts.User,
    PatientQueries,
    LinkPreviewGenerator,
    Message.Reaction,
    Message.LinkPreview,
    Engage.Conversation,
    Engage.ConversationQueries,
    Engage.ConversationMessage,
    Engage.ConversationMessage.ConversationMessageCreation,
    Engage.ConversationAuthorization,
    Engage.ConversationMessageAuthorization,
    Elasticsearch.ConversationMessageSearch,
    ReadStatus
  }

  alias Stitch.Web.EventsChannel

  alias StitchEngage.Web.{
    ConversationChannel,
    Api.V1.ConversationMessageView
  }

  action_fallback(Stitch.Web.Api.FallbackController)

  # =========
  #   INDEX
  # =========

  def index(conn, params) do
    do_index(conn, params, conn.assigns.current_user)
  end

  def patient_index(conn, params) do
    do_index(conn, params, conn.assigns.patient)
  end

  defp do_index(conn, params = %{"conversation_id" => id}, user_or_patient) do
    with {:conversation, conversation} when not is_nil(conversation) <-
           {:conversation, Repo.get(Conversation, id)},
         {:authorized?, true} <-
           {:authorized?, ConversationAuthorization.can_view?(conversation, user_or_patient)} do
      conversation_messages = load_messages(id, params["max_id"], params["limit"])

      render(conn, "index.json", conversation_messages: conversation_messages)
    else
      {:conversation, _} -> {:error, :not_found, "Conversation not found"}
      {:authorized?, _} -> {:error, :not_authorized, "You cannot view this conversation."}
    end
  end

  defp load_messages(id, max_id, limit) do
    ConversationQueries.messages_for_conversation(
      id,
      max_id,
      limit
    )
  end

  # ==========
  #   SEARCH
  # ==========

  def search(conn, params) do
    do_search(conn, params, conn.assigns.current_user)
  end

  def patient_search(conn, params) do
    do_search(conn, params, conn.assigns.patient)
  end

  def do_search(conn, params, user_or_patient) do
    types = %{
      term: :string,
      skip: :integer,
      limit: :integer,
      order: :string,
      after: :string,
      before: :string,
      author_id: :integer,
      conversation_id: {:array, :integer}
    }

    search_options = cast_params(types, params)
    result = ConversationMessageSearch.search_for_params(user_or_patient, search_options)
    render_search_result(conn, result)
  end

  def render_search_result(conn, {:ok, result}) do
    render(conn, "search.json", result)
  end

  def render_search_result(_conn, _result) do
    {:error, :unprocessable_entity, "Error peforming the search."}
  end

  # ========
  #   SHOW
  # ========

  def show(conn, params) do
    do_show(conn, params, conn.assigns.current_user)
  end

  def patient_show(conn, params) do
    do_show(conn, params, conn.assigns.patient)
  end

  def do_show(conn, %{"id" => id}, user_or_patient) do
    with {:conversation_message, conversation_message} when not is_nil(conversation_message) <-
           {:conversation_message, Repo.get(ConversationMessage, id)},
         {:conversation, %Conversation{} = conversation} <-
           {:conversation, Repo.get(Conversation, conversation_message.conversation_id)},
         {:authorized?, true} <-
           {:authorized?, ConversationAuthorization.can_view?(conversation, user_or_patient)} do
      message_with_assocs = ConversationQueries.load_message_info(conversation_message)
      render(conn, "show.json", conversation_message: message_with_assocs)
    else
      {:conversation_message, _} ->
        {:error, :not_found, "The message you are looking for does not exist."}

      {:conversation, _} ->
        {:error, :not_found}

      {:authorized?, _} ->
        {:error, :not_authorized, "You cannot view this message."}
    end
  end

  # ==========
  #   CREATE
  # ==========

  def create(conn, params) do
    do_create(conn, params, conn.assigns.current_user)
  end

  def patient_create(conn, params) do
    do_create(conn, params, conn.assigns.patient)
  end

  defp do_create(
         conn,
         %{"conversation_id" => conversation_id, "message" => message_params},
         user_or_patient
       ) do
    message_params_with_client = Stitch.Message.Params.with_client_attrs(conn, message_params)

    with {:conversation, %Conversation{} = conversation} <-
           {:conversation, Repo.get(Conversation, conversation_id)},
         {:authorized?, true} <-
           {:authorized?, ConversationAuthorization.can_message?(conversation, user_or_patient)},

         # Notifications: pass into the message creation & return notify_user_ids
         # presence_user_ids = UserStatusService.presence_user_ids(user_or_patient.team_id)

         {:ok, %{conversation_message: conversation_message}} <-
           ConversationMessageCreation.create_with_optional_upload(
             conversation,
             user_or_patient,
             message_params_with_client
           ) do
      # Notifications: get notify_user_ids in the create and pass them into events
      notify_user_ids = %{}

      conversation_message = Repo.preload(conversation_message, [:provider, :patient])
      message_created_events(conversation_message, conversation, notify_user_ids)

      conn
      |> put_status(:created)
      |> render("show.json", conversation_message: conversation_message)
    else
      {:conversation, _} ->
        {:error, :not_found, "The conversation you are looking for does not exist."}

      {:authorized?, false} ->
        {:error, :not_authorized, "You cannot send messages in this conversation."}

      {:error, changeset} ->
        {:error, :unprocessable_entity, changeset_errors_to_string(changeset)}

      _ ->
        {:error, :unprocessable_entity}
    end
  end

  # ==========
  #   UPDATE
  # ==========

  def update(conn, %{"id" => id, "message" => message_params}) do
    user = conn.assigns.current_user

    with {:conversation_message, conversation_message} when not is_nil(conversation_message) <-
           {:conversation_message, Repo.get(ConversationMessage, id)},
         {:authorized?, true} <-
           {:authorized?, ConversationMessageAuthorization.can_edit?(conversation_message, user)},
         {:ok, updated_conversation_message} <-
           ConversationMessage.update(conversation_message, message_params) do
      updated_message_with_assocs =
        ConversationQueries.load_message_info(updated_conversation_message)

      ConversationChannel.broadcast_message_edited(updated_message_with_assocs)
      LinkPreviewGenerator.queue(updated_message_with_assocs)
      Stitch.Elasticsearch.ConversationMessageSearch.add_to_index(updated_conversation_message)

      render(conn, "show.json", conversation_message: updated_message_with_assocs)
    else
      {:conversation_message, _} ->
        {:error, :not_found, "The message you are looking for does not exist."}

      {:authorized?, false} ->
        {:error, :not_authorized, "You cannot edit this message."}

      {:error, changeset} ->
        {:error, :unprocessable_entity, changeset_errors_to_string(changeset)}

      _error ->
        {:error, :unprocessable_entity, "There was a problem editing this message."}
    end
  end

  # ==========
  #   DELETE
  # ==========

  def delete(conn, %{"id" => id}) do
    user = conn.assigns.current_user

    with {:conversation_message, conversation_message} when not is_nil(conversation_message) <-
           {:conversation_message, Repo.get(ConversationMessage, id)},
         {:conversation, %Conversation{} = conversation} <-
           {:conversation, Repo.get(Conversation, conversation_message.conversation_id)},
         {:authorized?, true} <-
           {:authorized?,
            ConversationMessageAuthorization.can_delete?(conversation_message, conversation, user)},
         {:ok, _conversation_message} <- ConversationMessage.delete(conversation_message, user) do
      message_deleted_events(conversation, conversation_message)

      send_resp(conn, :no_content, "")
    else
      {:conversation, _} ->
        {:error, :not_found}

      {:conversation_message, _} ->
        {:error, :not_found}

      {:authorized?, false} ->
        {:error, :not_authorized, "You cannot delete this message."}

      _error ->
        {:error, :unprocessable_entity, "There was a problem deleting this message."}
    end
  end

  # =========
  #   REACT
  # =========

  def patient_toggle_reaction(conn, params) do
    do_toggle_reaction(conn, params, conn.assigns.patient)
  end

  def toggle_reaction(conn, params) do
    do_toggle_reaction(conn, params, conn.assigns.current_user)
  end

  defp do_toggle_reaction(conn, %{"id" => id, "emoji_name" => emoji_name}, user_or_patient) do
    with {:conversation_message, conversation_message} when not is_nil(conversation_message) <-
           {:conversation_message, Repo.get(ConversationMessage, id)},
         {:conversation, %Conversation{} = conversation} <-
           {:conversation, Repo.get(Conversation, conversation_message.conversation_id)},
         {:authorized?, true} <-
           {:authorized?, ConversationAuthorization.can_view?(conversation, user_or_patient)} do
      {:ok, _reaction} =
        Reaction.toggle_reaction(conversation_message, user_or_patient, emoji_name)

      ConversationChannel.broadcast_reactions_updated(conversation, conversation_message)

      json(conn, %{status: "ok"})
    else
      {:conversation_message, _} ->
        {:error, :not_found, "The message you are looking for does not exist."}

      {:conversation, _} ->
        {:error, :not_found}

      {:authorized?, false} ->
        {:error, :not_authorized, "You cannot react to this message."}
    end
  end

  # =======================
  #   DELETE LINK PREVIEW
  # =======================

  def delete_message_link_preview(
        conn,
        %{"id" => _conversation_message_id, "link" => _link} = params
      ) do
    do_delete_message_link_preview(conn, params, conn.assigns.current_user)
  end

  def patient_delete_message_link_preview(
        conn,
        %{"id" => _conversation_message_id, "link" => _link} = params
      ) do
    do_delete_message_link_preview(conn, params, conn.assigns.patient)
  end

  defp do_delete_message_link_preview(conn, params, user_or_patient) do
    %{"id" => conversation_message_id, "link" => link} = params

    with {:conversation_message, %ConversationMessage{} = conversation_message} <-
           {:conversation_message, Repo.get(ConversationMessage, conversation_message_id)},
         {:conversation, conversation} <-
           {:conversation, Repo.get(Conversation, conversation_message.conversation_id)},
         {:authorized?, true} <-
           {:authorized?,
            ConversationMessageAuthorization.can_delete_link_preview?(
              conversation_message,
              conversation,
              user_or_patient
            )} do
      conversation_message = LinkPreview.delete!(conversation_message, link)

      ConversationChannel.broadcast_msg_link_preview_deleted(
        conversation,
        conversation_message.id,
        link
      )

      json(conn, %{status: "ok"})
    else
      {:conversation_message, _} -> {:error, :not_found}
      {:conversation, _} -> {:error, :not_found}
      {:authorized?, false} -> {:error, :not_authorized, "You cannot edit this message."}
    end
  end

  # ================
  #   MARK AS READ
  # ================

  def mark_as_read(conn, %{"conversation_id" => _conversation_id} = params) do
    do_mark_as_read(conn, params, conn.assigns.current_user)
  end

  def patient_mark_as_read(conn, %{"conversation_id" => _conversation_id} = params) do
    do_mark_as_read(conn, params, conn.assigns.patient)
  end

  def do_mark_as_read(conn, %{"conversation_id" => conversation_id}, user_or_patient) do
    with {:conversation, %Conversation{} = conversation} <-
           {:conversation, Repo.get(Conversation, conversation_id)},
         {:ok, response} <-
           ReadStatus.mark_as_read(:conversation_message, conversation, user_or_patient) do
      %{
        mark_conversation_messages_as_read: {_, conversation_messages},
        mark_conversation_as_read: {1, [conversation_user]}
      } = response

      conversation_messages =
        Reaction.apply_reactions(conversation_messages, :conversation_message) || []

      conversation_messages_json =
        ConversationMessageView.render("index.json", %{
          conversation_messages: conversation_messages
        })

      mark_as_read_json =
        ConversationMessageView.render("mark_as_read.json", %{
          conversation_messages_json: conversation_messages_json,
          conversation_user: conversation_user
        })

      mark_as_read_events(
        conversation,
        user_or_patient,
        conversation_messages_json,
        mark_as_read_json
      )

      json(conn, mark_as_read_json)
    else
      _ -> {:error, :not_found}
    end
  end

  # ==================
  #   MARK AS UNREAD
  # ==================

  def mark_as_unread(conn, %{
        "conversation_id" => conversation_id,
        "conversation_message_id" => conversation_message_id
      }) do
    current_user = conn.assigns.current_user

    with {:conversation, %Conversation{} = conversation} <-
           {:conversation, Repo.get(Conversation, conversation_id)},
         {:conversation_message, %ConversationMessage{} = conversation_message} <-
           {:conversation_message, Repo.get(ConversationMessage, conversation_message_id)},
         {:ok, response} <-
           ReadStatus.mark_as_unread(
             :conversation_message,
             current_user,
             conversation,
             conversation_message
           ) do
      %{
        mark_messages_as_unread: {_, conversation_messages},
        mark_conversation_as_unread: {1, [conversation_user]}
      } = response

      conversation_messages =
        Reaction.apply_reactions(conversation_messages, :conversation_message)

      conversation_messages_json =
        ConversationMessageView.render("index.json", %{
          conversation_messages: conversation_messages
        })

      mark_as_read_json =
        ConversationMessageView.render("mark_as_read.json", %{
          conversation_messages_json: conversation_messages_json,
          conversation_user: conversation_user
        })

      mark_as_unread_events(
        conversation,
        current_user,
        conversation_messages_json,
        mark_as_read_json
      )

      json(conn, mark_as_read_json)
    else
      _ ->
        {:error, :not_found}
    end
  end

  # ===========
  #   PRIVATE
  # ===========

  defp message_created_events(conversation_message, conversation, _notify_user_ids) do
    # Stitch.Mobile.NotificationLogger.start(message, notify_user_ids.mobile)

    # Get the updated_at time before spawning the task
    now = DateTime.utc_now() |> DateTime.to_naive()

    Stitch.Task.start(fn ->
      Conversation.touch_and_broadcast_update(
        conversation,
        conversation_message,
        now
      )

      ConversationChannel.broadcast_message_created(conversation_message)
      LinkPreviewGenerator.queue(conversation_message)

      update_patient_unread_conversations(conversation)

      # Notifications: dispatch notifications, badge updates, and emails here
      # (see message view for similar code)
    end)
  end

  defp message_deleted_events(conversation, conversation_message) do
    Stitch.Task.start(fn ->
      # Notifications: Change Badge Count Here

      ConversationChannel.broadcast_message_deleted(%{
        conversation_id: conversation.id,
        id: conversation_message.id
      })

      update_patient_unread_conversations(conversation)

      # Reminder to also remove from index when conversation, patient, provider, or inbox deletion are implemented
      #   (the deletion of those records trigger the cascading delete of conversation_messages).
      Stitch.Elasticsearch.ConversationMessageSearch.delete_from_index(conversation_message)
    end)
  end

  defp mark_as_read_events(
         conversation,
         %User{} = user,
         conversation_messages_json,
         mark_as_read_json
       ) do
    Stitch.Task.start(fn ->
      EventsChannel.broadcast_conversation_provider_marked_as_read(user, mark_as_read_json)
      ConversationChannel.broadcast_provider_read_status(conversation, conversation_messages_json)

      # Notifications: update user badges on mobile
    end)
  end

  defp mark_as_read_events(
         conversation,
         %Patient{} = patient,
         conversation_messages_json,
         mark_as_read_json
       ) do
    Stitch.Task.start(fn ->
      EventsChannel.broadcast_conversation_patient_marked_as_read(patient, mark_as_read_json)
      ConversationChannel.broadcast_patient_read_status(conversation, conversation_messages_json)
      update_patient_unread_conversations(patient)

      # Notifications: update patient badges on mobile
    end)
  end

  defp mark_as_unread_events(conversation, user, conversation_messages_json, mark_as_read_json) do
    Stitch.Task.start(fn ->
      EventsChannel.broadcast_conversation_marked_as_unread(user, mark_as_read_json)
      ConversationChannel.broadcast_provider_read_status(conversation, conversation_messages_json)

      # Notifications: update user badges on mobile
    end)
  end

  defp update_patient_unread_conversations(%Conversation{} = conversation) do
    conversation = Repo.preload(conversation, :patients)
    patient = conversation.patients |> List.first()
    update_patient_unread_conversations(patient)
  end

  defp update_patient_unread_conversations(%Patient{} = patient) do
    unread_conversations_count = PatientQueries.unread_conversations_count(patient.id)
    EventsChannel.broadcast_unread_conversations_count(patient, unread_conversations_count)
  end
end
