defmodule StitchConnect.Web.Api.V1.BotsController do
  use StitchConnect.Web, :controller
  alias Stitch.{Bot, BotAuthorization}

  def index(conn, _params) do
    with true <-
           BotAuthorization.can_list_bots?(
             conn.assigns.team.id,
             conn.assigns.current_user.id
           ) do
      bots = Bot.team_bots(conn.assigns.team.id)
      render(conn, "index.json", bots: bots)
    else
      _ ->
        conn
        |> json(%{message: "You're not allowed to view bots."})
    end
  end

  def create(conn, params) do
    with true <-
           BotAuthorization.can_create_bot?(conn.assigns.team.id, conn.assigns.current_user.id),
         {:ok, bot} <- Bot.create(conn.assigns.team.id, params) do
      render(conn, "show.json", bot: bot)
    else
      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: changeset_errors_to_string(changeset)})

      false ->
        conn
        |> json(%{message: "You're not allowed to create bots."})
    end
  end

  def update(conn, %{"id" => id} = params) do
    with true <-
           BotAuthorization.can_edit_bot?(conn.assigns.team.id, conn.assigns.current_user.id),
         {:ok, bot} <- Bot.update(id, params) do
      render(conn, "show.json", bot: bot)
    else
      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: changeset_errors_to_string(changeset)})

      false ->
        conn
        |> json(%{message: "You're not allowed to edit bots."})
    end
  end
end
