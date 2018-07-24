defmodule Stitch.Web.Api.V1.FileController do
  use Stitch.Web, :controller

  alias Stitch.{
    Files.FileQueries,
    Files.Upload,
    Files.FileAuthorization,
    Group,
    GroupAuthorization,
    GroupQueries,
    Message,
    Message.MessageCreation,
    MessageQueries,
    Web.FileService,
    Web.UrlService,
    Web.MessageEventsService,
    StarrableItems.StarringService
  }

  alias StitchConnect.Web.{
    GroupChannel,
    UserStatusService,
    MessageEventsService
  }

  action_fallback(Stitch.Web.Api.V1.FallbackController)

  plug(:parse_query_params when action in [:index])

  def index(conn, _params) do
    current_user = conn.assigns.current_user
    files = FileQueries.for_user(current_user, conn.assigns.query_options)
    render(conn, "index.json", files: files)
  end

  def show(conn, %{"id" => "f" <> _ = encoded_file_id}) do
    with {:upload_id, {:ok, upload_id}} <- {:upload_id, Upload.decode_url_id(encoded_file_id)} do
      do_show(conn, upload_id)
    else
      _ ->
        {:error, :not_found}
    end
  end

  def show(conn, %{"id" => upload_id}) do
    do_show(conn, upload_id)
  end

  def do_show(conn, upload_id) do
    current_user = conn.assigns.current_user

    with {:upload, %Upload{} = upload} <-
           {:upload, FileQueries.get_by_id(upload_id, preload_assoc: true)},
         {:authorized, true, _} <-
           {:authorized, FileAuthorization.can_view?(upload, current_user), upload} do
      render(conn, "show_with_comments.json", %{file: upload})
    else
      {:upload, _} ->
        {:error, :not_found}

      {:authorized, false, upload} ->
        conn
        |> put_session(:redirect_url, UrlService.file_show_url(upload))
        |> redirect(external: UrlService.team_login_url(upload))
        |> halt

      _ ->
        {:error, :not_found}
    end
  end

  def share(conn, %{"group_id" => group_id, "id" => upload_id} = attrs) do
    current_user = conn.assigns.current_user
    presence = UserStatusService.presence_user_ids(current_user.team_id)

    with {:upload, %Upload{} = upload} <-
           {:upload, FileQueries.get_by_id(upload_id, preload_assoc: true)},
         {:group, %Group{} = group} <- {:group, GroupQueries.get_by_id(group_id)},
         {:authorized, true} <- {:authorized, GroupAuthorization.can_view?(group, current_user)},
         {:authorized, true} <- {:authorized, FileAuthorization.can_view?(upload, current_user)},
         {:shared, {_, _}} <- {:shared, Upload.share_with_group(upload, group)},
         upload <- %{upload | shared_in: Enum.uniq([group.id | upload.shared_in])},
         {:joined, _} <- {:joined, ensure_joined(group, current_user)},
         {:message, {:ok, %{message: message, notify_user_ids: notify_user_ids}}} <-
           {:message, create_message(group, upload, current_user, presence)},
         {:comment, _} <-
           {:comment, FileService.create_optional_comment(upload, current_user, presence, attrs)} do
      message = MessageQueries.get_by_id(message.id)
      MessageEventsService.message_creation_events(message, group, notify_user_ids)
      upload = FileQueries.get_by_id(upload.id, preload_assoc: true)
      file_details_update(upload)

      render(conn, "show_with_comments.json", %{file: upload})
    else
      {:upload, _} ->
        {:error, :not_found}

      {:group, _} ->
        {:error, :not_found}

      {:authorized, false} ->
        {:error, :not_authorized}

      {:shared, {:error, "not found"}} ->
        {:error, :unprocessable_entity, "The file is not shared"}

      _ ->
        {:error, :unprocessable_entity, "Error sharing the file"}
    end
  end

  def ensure_joined(group, user) do
    with false <- Group.direct_message?(group),
         false <- GroupAuthorization.is_member?(group.id, user.id) do
      Group.add_user(group, user.id)

      Stitch.Task.start(fn ->
        GroupChannel.broadcast_members_update(group, [], [user])
      end)
    else
      true -> :ok
    end
  end

  def create_message(group, upload, current_user, presence) do
    message = %Message{group: group, user: current_user, upload: upload}
    attrs = %{"type" => "file_share", "fields" => Upload.fields(upload)}
    MessageCreation.do_create(message, attrs, presence)
  end

  def file_details_update(upload) do
    GroupChannel.broadcast_file_details_update(upload)
  end

  def unshare(conn, %{"group_id" => group_id, "id" => upload_id}) do
    current_user = conn.assigns.current_user

    with {:upload, %Upload{} = upload} <- {:upload, FileQueries.get_by_id(upload_id)},
         {:group, %Group{} = group} <- {:group, GroupQueries.get_by_id(group_id)},
         {:authorized, true} <-
           {:authorized, FileAuthorization.can_unshare?(upload, current_user, group)},
         {:unshared, {:ok, _}} <- {:unshared, Upload.unshare_from_group(upload, group)} do
      upload = FileQueries.get_by_id(upload_id, preload_assoc: true)
      file_details_update(upload)
      render(conn, "show_with_comments.json", %{file: upload})
    else
      {:upload, _} ->
        {:error, :not_found}

      {:group, _} ->
        {:error, :not_found}

      {:authorized, false} ->
        {:error, :not_authorized}

      {:unshared, {:error, "not found"}} ->
        {:error, :unprocessable_entity, "The file is not shared"}

      {:unshared, _} ->
        {:error, :unprocessable_entity, "Error unsharing the file"}
    end
  end

  def create_public_link(conn, %{"id" => upload_id}) do
    current_user = conn.assigns.current_user

    with {:upload, %Upload{} = upload} <-
           {:upload, FileQueries.get_by_id(upload_id, preload_assoc: true)},
         {:authorized, true} <- {:authorized, FileAuthorization.can_view?(upload, current_user)},
         {:public_link, {:ok, %{upload: upload}}} <-
           {:public_link, Upload.create_public_link(upload)} do
      file_public_link_events(upload)
      render(conn, "show.json", %{file: upload})
    else
      {:upload, _} ->
        {:error, :not_found}

      {:authorized, false} ->
        {:error, :not_authorized}

      {:public_link, :error} ->
        {:error, :unprocessable_entity, "Public link already exists"}
    end
  end

  def revoke_public_link(conn, %{"id" => upload_id}) do
    current_user = conn.assigns.current_user

    with {:upload, %Upload{} = upload} <-
           {:upload, FileQueries.get_by_id(upload_id, preload_assoc: true)},
         {:authorized, true} <- {:authorized, FileAuthorization.can_view?(upload, current_user)},
         {:public_link, {:ok, %{upload: upload}}} <-
           {:public_link, Upload.revoke_public_link(upload)} do
      file_public_link_events(upload)
      render(conn, "show.json", %{file: upload})
    else
      {:upload, _} ->
        {:error, :not_found}

      {:authorized, false} ->
        {:error, :not_authorized}

      {:public_link, :error} ->
        {:error, :unprocessable_entity, "Error revoking public link"}
    end
  end

  def file_public_link_events(upload) do
    GroupChannel.broadcast_file_public_link_updated(upload)
    file_details_update(upload)
  end

  def delete(conn, %{"id" => upload_id}) do
    current_user = conn.assigns.current_user

    with {:upload, %Upload{} = upload} <-
           {:upload, FileQueries.get_by_id(upload_id, preload_assoc: true)},
         {:authorized, true} <-
           {:authorized, FileAuthorization.can_delete?(upload, current_user)},
         {:deleted, {:ok, upload}} <- {:deleted, Upload.delete(upload)} do
      GroupChannel.broadcast_file_deleted(upload)
      render(conn, "show.json", %{file: upload})
    else
      {:upload, _} ->
        {:error, :not_found}

      {:authorized, false} ->
        {:error, :not_authorized}

      {:delete, :error} ->
        {:error, :unprocessable_entity, "Error deleting the file"}
    end
  end

  def toggle_star(conn, %{"id" => upload_id}) do
    current_user = conn.assigns.current_user

    with {:upload, %Upload{} = upload} <- {:upload, FileQueries.get_by_id(upload_id)},
         {:authorized, true} <- {:authorized, FileAuthorization.can_view?(upload, current_user)},
         {:starred, {starred, _result}} <-
           {:starred, StarringService.toggle_star(upload, current_user)} do
      upload = Map.put(upload, :starred, starred)
      render(conn, "show.json", %{file: upload})
    else
      {:upload, _} ->
        {:error, :not_found}

      {:authorized, false} ->
        {:error, :not_authorized}

      {:delete, :error} ->
        {:error, :unprocessable_entity, "Error deleting the file"}
    end
  end

  # This is solely for legacy electron apps
  #
  def presigned_url(conn, %{"id" => upload_id}) do
    current_user = conn.assigns.current_user

    with {:upload, %Upload{} = upload} <- {:upload, FileQueries.get_by_id(upload_id)},
         {:authorized, true} <- {:authorized, FileAuthorization.can_view?(upload, current_user)} do
      url = UrlService.file_download_url(upload, %{authenticationToken: current_user.token})
      json(conn, %{presigned_url: url})
    else
      {:upload, _} ->
        {:error, :not_found}

      {:authorized, false} ->
        {:error, :not_authorized}
    end
  end

  def parse_query_params(conn, _opts) do
    types = %{
      creator_id: :integer,
      group_id: :integer,
      filetype: :string,
      limit: :integer,
      skip: :integer
    }

    changeset = Ecto.Changeset.cast({%{}, types}, conn.params, Map.keys(types))
    assign(conn, :query_options, changeset.changes)
  end
end
