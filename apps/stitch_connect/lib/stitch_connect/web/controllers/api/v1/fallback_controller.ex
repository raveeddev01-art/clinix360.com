defmodule StitchConnect.Web.Api.V1.FallbackController do
  use StitchConnect.Web, :controller

  def call(conn, {:error, %Ecto.Changeset{} = changeset}) do
    conn
    |> put_status(:unprocessable_entity)
    |> render(StitchConnect.Web.Api.V1.ChangesetView, "error.json", changeset: changeset)
  end
end
