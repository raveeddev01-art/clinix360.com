defmodule StitchConnect.Web.Api.V1.UploadController do
  use StitchConnect.Web, :controller
  alias Stitch.{Repo, Group, MessageQueries, AWS.S3}

  def index(conn, %{"group_id" => group_id} = params) do
    skip = Map.get(params, "skip", 0)
    limit = Map.get(params, "limit", 10)
    current_user = conn.assigns.current_user
    group = Repo.get!(Group, group_id)

    uploads = MessageQueries.get_uploads_for_user(group, current_user, skip, limit)

    conn
    |> render("index.json", %{uploads: uploads, user_id: current_user.id})
  end

  def index(conn, params) do
    skip = Map.get(params, "skip", 0)
    limit = Map.get(params, "limit", 10)
    current_user = conn.assigns.current_user

    uploads = MessageQueries.get_uploads_for_user(current_user, skip, limit)

    conn
    |> render("index.json", %{uploads: uploads, user_id: current_user.id})
  end

  def create(conn, %{"filename" => filename, "mimetype" => mimetype}) do
    conn
    |> put_status(:created)
    |> render("create.json", signature: S3.signature(filename, mimetype))
  end
end
