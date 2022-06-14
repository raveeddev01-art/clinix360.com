defmodule StitchConnect.Web.Api.V1.MessageController do
  use Stitch.Web, :controller

  alias StitchConnect.Web.{
    GroupChannel,
    PushNotifications,
    UserStatusService,
    Api.V1.MessageView,
    MessageEventsService
  }

  alias Stitch.Web.{
    StarringEventsService,
    UrlService,
    FileService
  }

  alias Stitch.{
    GroupAuthorization,
    GroupQueries,
    Group,
    Files,
    StarrableItems.StarringService,
    Message,
    MessageAuthorization,
    MessageAction,
    MessageQueries,
    # Message.Upload,
    ReadStatus,
    Web.EventsChannel,
    Web.FileService
  }

  action_fallback(Stitch.Web.Api.V1.FallbackController)

  plug(:parse_query_params when action in [:index, :feed_recent, :search, :feed_surrounding])

  def index(conn, %{"group_id" => group_id} = params) do
    current_user = conn.assigns.current_user
    authenticated_urls = get_authenticated_urls(params)

    with {:group, %Group{} = group} <- {:group, GroupQueries.get_by_id(group_id)},
         {:authorized?, true} <- {:authorized?, GroupAuthorization.can_view?(group, current_user)} do
      messages =
        MessageQueries.group_latest_messages(group_id, current_user, conn.assigns.query_opts)

      render(conn, "index.json", messages: messages, authenticated_urls: authenticated_urls)
    else
      {:group, _} ->
        {:error, :not_found, "The room you are looking for does not exist."}

      {:authorized?, false} ->
        {:error, :not_authorized, "You can't see the messages for this room."}
    end
  end

  def get_authenticated_urls(%{"authenticated_urls" => "true"}), do: true
  def get_authenticated_urls(_params), do: false

  def feed_recent(conn, %{"group_id" => group_id}) do
    current_user = conn.assigns.current_user

    with {:group, %Group{} = group} <- {:group, GroupQueries.get_by_id(group_id)},
         {:authorized?, true} <- {:authorized?, GroupAuthorization.can_view?(group, current_user)} do
      messages =
        MessageQueries.group_recent_messages(group_id, current_user, conn.assigns.query_opts)

      render(conn, "index.json", messages: messages, user_id: current_user.id)
    else
      {:group, _} ->
        {:error, :not_found, "The room you are looking for does not exist."}

      {:authorized?, false} ->
        {:error, :not_authorized, "You can't see the messages for this room."}
    end
  end

  def search(conn, params) do
    types = %{
      term: :string,
      skip: :integer,
      limit: :integer,
      search_order: :string,
      after: :string,
      before: :string,
      author_id: :integer,
      conversation_id: {:array, :integer}
    }

    search_options = cast_params(types, params)
    current_user = conn.assigns.current_user
    messages = Stitch.Elasticsearch.MessageSearch.search_for_params(current_user, search_options)
    |> IO.inspect(label: "after search")
    render(conn, "index.json", messages: messages, user_id: current_user.id)
  end

  def feed_surrounding(conn, %{"group_id" => group_id, "message_id" => message_id}) do
    current_user = conn.assigns.current_user

    with {:group, %Group{} = group} <- {:group, GroupQueries.get_by_id(group_id)},
         {:authorized?, true} <-
           {:authorized?, GroupAuthorization.can_view?(group, current_user)},
         {:message, %Message{} = message} <-
           {:message, MessageQueries.get_by_id(message_id, false)} do
      feed_surrounding =
        MessageQueries.surrounding(message, group, current_user, conn.assigns.query_opts)

      render(conn, "feed_surrounding.json", feed_surrounding)
    else
      {:group, _} ->
        {:error, :not_found, "The room you are looking for does not exist."}

      {:authorized?, false} ->
        {:error, :not_authorized, "You can't see the messages for this room."}

      {:message, _} ->
        {:error, :not_found}
    end
  end

  def create(conn, %{"group_id" => group_id, "message" => message_params}) do
    IO.inspect(message_params, label: "message params")
    current_user = conn.assigns.current_user
    presence = UserStatusService.presence_user_ids(current_user.team_id)
    authenticated_urls = get_authenticated_urls(message_params)
    message_params_with_client = Message.Params.with_client_attrs(conn, message_params)

    with {:group, %Group{} = group} <- {:group, GroupQueries.get_by_id(group_id)},
         {:authorized?, true} <-
           {:authorized?, GroupAuthorization.can_message?(group, current_user.id)},
         {:ok, %{message: message, notify_user_ids: notify_user_ids}} <-
           Message.create(group, current_user, message_params_with_client, presence) do
      message = %{message | user: current_user}
      # create_optional_upload_comment(message, group, current_user, presence, message_params)
      message = MessageQueries.load_message(message.id, current_user)
      MessageEventsService.message_creation_events(message, group, notify_user_ids)

      IO.inspect(message, label: "here is created message")

      conn
      |> put_status(:created)
      |> render("show.json", message: message, authenticated_urls: authenticated_urls)
    else
      {:group, _} ->
        {:error, :not_found, "The room you are looking for does not exist."}

      {:authorized?, false} ->
        {:error, :not_authorized, "You can't see the messages for this room."}

      {:error, :message, changeset, _changeset_so_far} ->
        {:error, :unprocessable_entity, changeset_errors_to_string(changeset)}
    end
  end

  def create_optional_upload_comment(
        %Message{type: "file_share"} = message,
        group,
        current_user,
        presence,
        attrs
      ) do
    upload = %{message.upload | shared_in: [group.id]}
    FileService.create_optional_comment(upload, current_user, presence, attrs)
  end

  def create_optional_upload_comment(_message, _group, _current_user, _presence, _attrs), do: nil

  def mark_as_read(conn, %{"group_id" => group_id}) do
    current_user = conn.assigns.current_user

    with {:group, %Group{} = group} <- {:group, GroupQueries.get_by_id(group_id)},
         {:ok, response} <- ReadStatus.mark_as_read(:message, current_user.id, group.id) do
      %{mark_messages_as_read: {_, messages}, mark_group_as_read: {1, [group_user]}} = response
      messages_json = MessageView.render("index.json", %{messages: messages})

      mark_as_read_json =
        MessageView.render("mark_as_read.json", %{
          messages_json: messages_json,
          group_user: group_user
        })

      mark_as_read_events(group, current_user, messages_json, mark_as_read_json)
      json(conn, mark_as_read_json)
    else
      _ -> {:error, :not_found}
    end
  end

  def mark_as_read_events(group, current_user, messages_json, json) do
    Stitch.Task.start(fn ->
      EventsChannel.broadcast_marked_as_read(current_user, json)
      GroupChannel.broadcast_read_status(group, messages_json)
      PushNotifications.push_badge_update_to_user(current_user)
    end)
  end

  def mark_as_unread(conn, %{"group_id" => group_id, "message_id" => message_id}) do
    current_user = conn.assigns.current_user

    with {:group, %Group{} = group} <- {:group, GroupQueries.get_by_id(group_id)},
         {:message, %Message{} = message} <-
           {:message, MessageQueries.get_by_id(message_id, false)},
         {:ok, response} <-
           ReadStatus.mark_as_unread(:message, current_user.id, group.id, message) do
      %{mark_messages_as_unread: {_, messages}, mark_group_as_unread: {1, [group_user]}} =
        response

      messages_json = MessageView.render("index.json", %{messages: messages})

      mark_as_read_json =
        MessageView.render("mark_as_read.json", %{
          messages_json: messages_json,
          group_user: group_user
        })

      mark_as_unread_events(group, current_user, messages_json, mark_as_read_json)
      json(conn, mark_as_read_json)
    else
      _ -> {:error, :not_found}
    end
  end

  def mark_as_unread_events(group, current_user, messages_json, json) do
    Stitch.Task.start(fn ->
      EventsChannel.broadcast_marked_as_unread(current_user, json)
      GroupChannel.broadcast_read_status(group, messages_json)
      PushNotifications.push_badge_update_to_user(current_user)
    end)
  end

  def download(conn, %{"id" => message_id}) do
    user = conn.assigns.current_user

    with {:message, %Message{type: "file_share"} = message} <-
           {:message, MessageQueries.load_message(message_id, user)},
         {:upload, %Files.Upload{} = upload} <-
           {:upload, Files.FileQueries.get_by_id(message.upload_id, preload_assoc: true)},
         {:authorized?, true} <- {:authorized?, GroupAuthorization.can_view?(message.group, user)} do
      url = UrlService.file_download_url(upload, %{authenticationToken: user.token})
      json(conn, %{presigned_url: url})
    else
      {:message, _} -> {:error, :not_found}
      {:authorized?, false} -> {:error, :not_found}
      :error -> {:error, :not_found}
    end
  end

  def update(conn, %{"id" => message_id, "message" => message_params}) do
    current_user = conn.assigns.current_user

    with {:message, %Message{type: message_type} = message} when message_type in ["chat"] <-
           {:message, MessageQueries.get_by_id(message_id)},
         {:authorized?, true} <-
           {:authorized?, MessageAuthorization.can_edit?(message, current_user)},
         {:updated, {:ok, message}} <- {:updated, Message.update(message, message_params)} do
      message = MessageQueries.load_info(message)
      MessageEventsService.message_edit_events(message)
      render(conn, "show.json", message: message, user_id: current_user.id)
    else
      # When an old client is trynig to update "file_comment" via messages API
      # TODO: Deprecate once most client start using the new file API.
      {:message, %Message{type: "file_comment"} = message} ->
        text_content = message_params["text_content"]
        upload_comment_id = message.upload_comment_id

        file_comment_update_result =
          FileService.update_file_comment(text_content, upload_comment_id, current_user)

        with {:updated_upload_comment, _updated_upload_comment} <- file_comment_update_result do
          message = MessageQueries.get_by_id(message_id)
          message = MessageQueries.load_info(message)
          MessageEventsService.message_edit_events(message)
          render(conn, "show.json", message: message, user_id: current_user.id)
        else
          error -> error
        end

      {:message, _} ->
        {:error, :not_found}

      {:authorized?, false} ->
        {:error, :not_found}

      {:error, :message, changeset, _changeset_so_far} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: changeset_errors_to_string(changeset)})
    end
  end

  def delete(conn, %{"id" => message_id}) do
    current_user = conn.assigns.current_user
    _team = conn.assigns.team

    with {:message, %Message{} = message} <- {:message, MessageQueries.get_by_id(message_id)},
         {:group, {:ok, group}} <-
           {:group, GroupQueries.get_by_id(message.group_id, current_user)},
         {:authorized?, true} <-
           {:authorized?, MessageAuthorization.can_delete?(message, current_user, group)},
         {:deleted, {:ok, %{message: message}}} <-
           {:deleted, Message.delete(message, current_user)} do
      MessageEventsService.message_delete_events(message)
      send_resp(conn, :no_content, "")
    else
      {:authorized?, false} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "You can't delete other users' messages"})

      {:deleted, {:error, _failed_operation, _failed_value, _changeset}} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Failed to delete message"})

      _ ->
        {:error, :not_found}
    end
  end

  def toggle_star(conn, %{"id" => message_id}) do
    message = MessageQueries.get_by_id(message_id)
    group = GroupQueries.get_by_id(message.group_id)
    user = conn.assigns.current_user

    case GroupAuthorization.can_view?(group, user) do
      true ->
        case StarringService.toggle_star(message, user) do
          {result, {:ok, _changest}} ->
            message = MessageQueries.load_info(message)
            message = Map.put(message, :starred, result)
            StarringEventsService.star_events(message, user, result)
            render(conn, "starred.json", message: message, user_id: user.id)

          {_result, {:error, changeset}} ->
            conn
            |> put_status(:unprocessable_entity)
            |> json(%{message: changeset_errors_to_string(changeset)})
        end

      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "You can't star messages belonging to this room."})
    end
  end

  def toggle_pin(conn, %{"id" => message_id}) do
    message = MessageQueries.get_by_id(message_id)
    user = conn.assigns.current_user

    case GroupAuthorization.is_member?(message.group_id, user.id) do
      true ->
        case MessageAction.toggle_pin(message, user) do
          {:ok, message} ->
            message = MessageQueries.load_info(message)
            GroupChannel.broadcast_message_pinned(message)
            render(conn, "show.json", message: message, user_id: user.id)

          {:error, changeset} ->
            conn
            |> put_status(:unprocessable_entity)
            |> json(%{message: changeset_errors_to_string(changeset)})
        end

      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "You can't pin messages belonging to this room."})
    end
  end

  def delete_message_link_preview(conn, %{"id" => message_id, "link" => link} = _params) do
    current_user = conn.assigns.current_user

    with {:message, %Message{} = message} <-
           {:message, MessageQueries.get_by_id(message_id, false)},
         {:group, %Group{} = group} <- {:group, GroupQueries.get_by_id(message.group_id)},
         {:authorized?, true} <-
           {:authorized?, MessageAuthorization.can_delete?(message, current_user, group)} do
      message = Message.LinkPreview.delete!(message, link)
      GroupChannel.broadcast_msg_link_preview_deleted(group, message.id, link)
      json(conn, %{status: "ok"})
    else
      {:message, _} -> {:error, :not_found}
      {:group, _} -> {:error, :not_found}
      {:authorized?, false} -> {:error, :not_authorized}
    end
  end

  def toggle_reaction(conn, %{"id" => message_id, "emoji_name" => emoji_name}) do
    current_user = conn.assigns.current_user

    with {:message, %Message{} = message} <-
           {:message, MessageQueries.get_by_id(message_id, false)},
         {:group, %Group{} = group} <- {:group, GroupQueries.get_by_id(message.group_id)},
         {:authorized?, true} <- {:authorized?, GroupAuthorization.can_view?(group, current_user)} do
      {:ok, _reaction} = Message.Reaction.toggle_reaction(message, current_user, emoji_name)
      GroupChannel.broadcast_reactions_updated(group, message)
      json(conn, %{status: "ok"})
    else
      {:message, _} -> {:error, :not_found}
      {:group, _} -> {:error, :not_found}
      {:authorized?, false} -> {:error, :not_authorized}
    end
  end

  def parse_query_params(conn, _opts) do
    types = %{
      skip: :integer,
      limit: :integer,
      min_id: :integer,
      max_id: :integer,
      search_order: :string
    }

    changeset = Ecto.Changeset.cast({%{}, types}, conn.params, Map.keys(types))
    query_opts = Enum.into(changeset.changes, [])
    query_opts = Keyword.put(query_opts, :fetch_users, get_fetch_users_param(conn.params))
    assign(conn, :query_opts, query_opts)
  end


  def show(conn, %{"id" => message_id}) do
    current_user = conn.assigns.current_user
    with {:message, %Message{} = message} <- {:message, MessageQueries.load_message(message_id, current_user)},
    {:authorized?, true} <- {:authorized?, GroupAuthorization.can_view?(message.group, current_user)} do
      render(conn, "show.json", %{message: message, authenticated_urls: true})
    else
      {:authorized?, false} ->
          {:error, :not_authorized, "You can't see the messages for this room."}

      _ ->
        {:error, :not_found}
    end
  end
end
