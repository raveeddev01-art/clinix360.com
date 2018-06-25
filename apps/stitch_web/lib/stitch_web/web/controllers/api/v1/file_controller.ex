defmodule Stitch.Web.Api.V1.FileController do
  use Stitch.Web, :controller

  alias Stitch.{
    Files.FileQueries,
    Files.Upload,
    Files.FileAuthorization,
    Group,
    GroupQueries,
    Web.UrlService
  }

  action_fallback(Stitch.Web.Api.V1.FallbackController)

  plug(:parse_query_params when action in [:index])

  def index(conn, _params) do
    current_user = conn.assigns.current_user
    files = FileQueries.for_user(current_user, conn.assigns.query_options)
    render(conn, "index.json", files: files)
  end

  def show(conn, %{"id" => "f" <> _ = encoded_file_id}) do
    current_user = conn.assigns.current_user

    with {:upload_id, {:ok, upload_id}} <- {:upload_id, Upload.decode_url_id(encoded_file_id)},
         {:upload, %Upload{} = upload} <- {:upload, FileQueries.get_by_id(upload_id)},
         {:authorized, true, _} <-
           {:authorized, FileAuthorization.can_view?(upload, current_user), upload} do
      render(conn, "show.json", %{file: upload})
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

  def unshare(conn, %{"group_id" => group_id, "id" => upload_id}) do
    current_user = conn.assigns.current_user

    with {:upload, %Upload{} = upload} <- {:upload, FileQueries.get_by_id(upload_id)},
         {:group, %Group{} = group} <- {:group, GroupQueries.get_by_id(group_id)},
         {:authorized, true} <- {:authorized, FileAuthorization.can_view?(upload, current_user)},
         {:unshared, {:ok, _}} <- {:unshared, Upload.unshare_from_group(upload, group)} do
      conn
      |> json(%{status: "ok"})
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
         {:authorized, true} <-
           {:authorized, FileAuthorization.is_creator?(upload, current_user)},
         {:public_link, {:ok, upload}} <- {:public_link, Upload.create_public_link(upload)} do
      conn
      |> json(%{public_link: upload.public_link})
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
         {:authorized, true} <-
           {:authorized, FileAuthorization.is_creator?(upload, current_user)},
         {:public_link, {:ok, upload}} <- {:public_link, Upload.revoke_public_link(upload)} do
      conn
      |> json(%{status: "ok"})
    else
      {:upload, _} ->
        {:error, :not_found}

      {:authorized, false} ->
        {:error, :not_authorized}

      {:public_link, :error} ->
        {:error, :unprocessable_entity, "Error revoking public link"}
    end
  end

  def parse_query_params(conn, _opts) do
    types = %{
      creator_id: :integer,
      filetype: :string
    }

    changeset = Ecto.Changeset.cast({%{}, types}, conn.params, Map.keys(types))
    assign(conn, :query_options, changeset.changes)
  end
end
