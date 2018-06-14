defmodule StitchEngage.Web.Api.V1.InboxController do
  use Stitch.Web, :controller

  alias Stitch.{
    Repo,
    Engage.Inbox,
    Engage.InboxQueries,
    Engage.InboxAuthorization
  }

  action_fallback(Stitch.Web.Api.FallbackController)

  def show_default(conn, _params) do
    team = conn.assigns.team

    case InboxQueries.default_for_team(team) do
      nil ->
        conn
        |> put_status(:not_found)
        |> json(%{message: "Inbox not found"})

      inbox ->
        render(conn, "show.json", inbox: inbox)
    end
  end

  def update(conn, params = %{"id" => id}) do
    user = conn.assigns.current_user

    with {:inbox, inbox} when not is_nil(inbox) <- {:inbox, Repo.get(Inbox, id)},
         {:authorized?, true} <- {:authorized?, InboxAuthorization.can_update?(inbox, user)},
         {:ok, updated_inbox} <- Inbox.update(inbox, params) do
      # broadcast inbox name update here
      render(conn, "show.json", inbox: updated_inbox)
    else
      {:authorized?, false} ->
        {:error, :not_authorized, "You cannot update this inbox."}

      {:inbox, _} ->
        {:error, :not_found}

      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: changeset_errors_to_string(changeset)})
    end
  end
end
