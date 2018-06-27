defmodule Stitch.Web.Api.V1.CallController do
  use Stitch.Web, :controller

  import Ecto.Query

  alias Stitch.{
    Repo,
    Call,
    Tokbox
  }

  def decline(conn, %{"hash" => hash}) do
    hash
    |> Call.get_by_hash()
    |> Repo.preload(messages: [:group])
    |> Tokbox.Events.do_update(%{
      status: "declined"
    })

    json(conn, %{status: :ok})
  end
end
