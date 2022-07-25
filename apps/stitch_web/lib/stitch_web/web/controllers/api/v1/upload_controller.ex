defmodule Stitch.Web.Api.V1.UploadController do
  use Stitch.Web, :controller
  use Stitch.Web.Api.V1.UploadDocs
  alias Stitch.{AWS.S3}

  def create(conn, %{"filename" => _filename, "mimetype" => _mimetype} = params) do
    IO.inspect(params, label: "params simple")
    do_create(conn, params)
  end

  def create(conn, %{"uploads" => uploads}) do
    IO.inspect(uploads, label: "Listed params")
    signatures =
      Enum.map(uploads, fn upload ->
        S3.signature(upload["filename"], upload["mimetype"])
      end)
      |> IO.inspect(label: "signatures generated")

    put_status(conn, :created)
    |> render("create.json", signature: signatures)
  end

  def patient_create(conn, params = %{"filename" => _filename, "mimetype" => _mimetype}) do
    do_create(conn, params)
  end

  defp do_create(conn, %{"filename" => filename, "mimetype" => mimetype}) do
    conn
    |> put_status(:created)
    |> render("create.json", signature: S3.signature(filename, mimetype))
  end
end
