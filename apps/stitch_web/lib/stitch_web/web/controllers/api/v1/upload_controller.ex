defmodule Stitch.Web.Api.V1.UploadController do
  use Stitch.Web, :controller
  use Stitch.Web.Api.V1.UploadDocs
  alias Stitch.{Repo, Group, MessageQueries, AWS.S3}

  def create(conn, params = %{"filename" => _filename, "mimetype" => _mimetype}) do
    do_create(conn, params)
  end

  def patient_create(conn, params = %{"filename" => _filename, "mimetype" => _mimetype}) do
    do_create(conn, params)
  end

  defp do_create(conn, %{"filename" => filename, "mimetype" => mimetype}) do
    S3.signature(filename, mimetype)

    conn
    |> put_status(:created)
    |> render("create.json", signature: S3.signature(filename, mimetype))
  end
end
