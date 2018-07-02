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
    Web.UrlService,
    Web.MessageEventsService
  }

  alias StitchConnect.Web.{
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

    with {:upload, %Upload{} = upload} <- {:upload, FileQueries.get_by_id(upload_id)},
         {:group, %Group{} = group} <- {:group, GroupQueries.get_by_id(group_id)},
         {:authorized, true} <- {:authorized, GroupAuthorization.can_view?(group, current_user)},
         {:authorized, true} <- {:authorized, FileAuthorization.can_view?(upload, current_user)},
         {:shared, {_, _}} <- {:shared, Upload.share_with_group(upload, group)},
         upload <- %{upload | shared_in: Enum.uniq([group.id, upload.shared_in])},
         {:joined, _} <- {:joined, ensure_joined(group, current_user)},
         {:message, _} <- {:message, create_message(group, current_user, upload)},
         {:comment, result} <- {:comment, create_optional_comment(conn, attrs, upload, group)} do
      conn
      |> json(%{status: "ok"})
    else
      {:upload, _} ->
        {:error, :not_found}

      {:group, _} ->
        {:error, :not_found}

      {:authorized, false} ->
        {:error, :not_authorized}

      {:shared, {:error, "not found"}} ->
        {:error, :unprocessable_entity, "The file is not shared"}

      {:shared, e} ->
        {:error, :unprocessable_entity, "Error sharing the file"}
    end
  end

  def ensure_joined(group, user) do
    with false <- Group.direct_message?(group),
         false <- GroupAuthorization.is_member?(group.id, user.id) do
      Group.add_user(group, user.id)
    else
      true -> :ok
    end
  end

  def create_message(group, current_user, upload) do
    presence = UserStatusService.presence_user_ids(current_user.team_id)
    message = %Message{group: group, user: current_user, upload: upload}
    attrs = %{"type" => "file_share", "fields" => Upload.fields(upload)}

    with {:ok, %{message: message, notify_user_ids: notify_user_ids}} <-
           MessageCreation.do_create(message, attrs, presence) do
      message = %{message | user: current_user}
      MessageEventsService.message_creation_events(message, group, notify_user_ids)
      :ok
    else
      _ -> :error
    end
  end

  def create_optional_comment(conn, %{"text_content" => text_content}, upload, group) do
    current_user = conn.assigns.current_user
    presence = UserStatusService.presence_user_ids(current_user.team_id)
    attrs = %{"text_content" => text_content}

    with {:comment, {:ok, comment, groups}} <-
           {:comment, UploadComment.create(upload, current_user, attrs, presence)} do
      Enum.each(groups, fn %{group: group, result: {:ok, result}} ->
        MessageEventsService.message_creation_events(
          result.message,
          group,
          result.notify_user_ids
        )
      end)
    else
      _ -> :error
    end
  end

  def create_optional_comment(conn, _attrs, _upload, _group), do: conn

  def unshare(conn, %{"group_id" => group_id, "id" => upload_id}) do
    current_user = conn.assigns.current_user

    with {:upload, %Upload{} = upload} <- {:upload, FileQueries.get_by_id(upload_id)},
         {:group, %Group{} = group} <- {:group, GroupQueries.get_by_id(group_id)},
         {:authorized, true} <- {:authorized, FileAuthorization.can_view?(upload, current_user)},
         {:unshared, {:ok, _}} <- {:unshared, Upload.unshare_from_group(upload, group)} do
      upload = FileQueries.get_by_id(upload_id, preload_assoc: true)
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

    with {:upload, %Upload{} = upload} <- {:upload, FileQueries.get_by_id(upload_id)},
         {:authorized, true} <- {:authorized, FileAuthorization.can_view?(upload, current_user)},
         {:public_link, {:ok, upload}} <- {:public_link, Upload.create_public_link(upload)} do
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

    with {:upload, %Upload{} = upload} <- {:upload, FileQueries.get_by_id(upload_id)},
         {:authorized, true} <- {:authorized, FileAuthorization.can_view?(upload, current_user)},
         {:public_link, {:ok, upload}} <- {:public_link, Upload.revoke_public_link(upload)} do
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

  def delete(conn, %{"id" => upload_id}) do
    current_user = conn.assigns.current_user

    with {:upload, %Upload{} = upload} <- {:upload, FileQueries.get_by_id(upload_id)},
         {:authorized, true} <-
           {:authorized, FileAuthorization.is_creator?(upload, current_user)},
         {:deleted, {:ok, upload}} <- {:deleted, Upload.delete(upload)} do
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

  def parse_query_params(conn, _opts) do
    types = %{
      creator_id: :integer,
      filetype: :string,
      limit: :integer,
      skip: :integer
    }

    changeset = Ecto.Changeset.cast({%{}, types}, conn.params, Map.keys(types))
    assign(conn, :query_options, changeset.changes)
  end
end
