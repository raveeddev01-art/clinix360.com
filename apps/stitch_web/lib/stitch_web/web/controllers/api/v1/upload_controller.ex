defmodule Stitch.Web.Api.V1.UploadController do
  use Stitch.Web, :controller
  use Stitch.Web.Api.V1.UploadDocs
  alias Stitch.{Repo, Group, MessageQueries, AWS.S3}

  def index(conn, %{"group_id" => group_id} = params) do
    skip = Map.get(params, "skip", 0)
    limit = Map.get(params, "limit", 10)
    authenticated_urls = get_authenticated_urls_param(params)
    current_user = conn.assigns.current_user
    group = Repo.get!(Group, group_id)

    uploads = MessageQueries.get_uploads_for_user(group, current_user, skip, limit)

    conn
    |> render("index.json", %{
      uploads: uploads,
      user_id: current_user.id,
      authenticated_urls: authenticated_urls
    })
  end

  def index(conn, params) do
    skip = Map.get(params, "skip", 0)
    limit = Map.get(params, "limit", 10)
    authenticated_urls = get_authenticated_urls_param(params)
    current_user = conn.assigns.current_user

    uploads = MessageQueries.get_uploads_for_user(current_user, skip, limit)

    conn
    |> render("index.json", %{
      uploads: uploads,
      user_id: current_user.id,
      authenticated_urls: authenticated_urls
    })
  end

  def create(conn, params = %{"filename" => _filename, "mimetype" => _mimetype}) do
    do_create(conn, params)
  end

  def patient_create(conn, params = %{"filename" => _filename, "mimetype" => _mimetype}) do
    do_create(conn, params)
  end

  defp do_create(conn, %{"filename" => filename, "mimetype" => mimetype}) do
    conn
    |> put_status(:created)
    |> render("create.json", signature: S3.signature(filename, mimetype))
  end

  def get_authenticated_urls_param(%{"authenticated_urls" => "true"}), do: true
  def get_authenticated_urls_param(_params), do: false
end
