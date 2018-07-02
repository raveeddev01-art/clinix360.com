defmodule StitchEngage.Web.Api.V1.InboxController do
  use Stitch.Web, :controller

  alias Stitch.{
    Repo,
    Engage.Inbox,
    Engage.InboxQueries,
    Engage.InboxAuthorization
  }

  action_fallback(Stitch.Web.Api.FallbackController)

  @doc """
  Returns the default inbox for a team and associated data necessary
  to render the main Engage page (conversations & latest message for each)
  """
  def show_default(conn, _params) do
    user = conn.assigns.current_user
    team = conn.assigns.team

    with {:inbox, inbox} when not is_nil(inbox) <- {:inbox, InboxQueries.default_for_team(team)},
         {:authorized?, true} <- {:authorized?, InboxAuthorization.can_view?(inbox, user)} do
      render(conn, "show.json", inbox: InboxQueries.with_show_values(inbox, user))
    else
      {:authorized?, false} ->
        {:error, :not_authorized, "You cannot view this inbox."}

      {:inbox, _} ->
        {:error, :not_found, "Inbox not found"}
    end
  end

  @doc """
  Updates an inbox.
  """
  def update(conn, params = %{"id" => id}) do
    user = conn.assigns.current_user

    with {:inbox, inbox} when not is_nil(inbox) <- {:inbox, Repo.get(Inbox, id)},
         {:authorized?, true} <- {:authorized?, InboxAuthorization.can_update?(inbox, user)},
         {:ok, updated_inbox} <- Inbox.update(inbox, params) do
      # TODO: broadcast inbox name change
      render(conn, "show.json", inbox: InboxQueries.with_show_values(updated_inbox, user))
    else
      {:authorized?, false} ->
        {:error, :not_authorized, "You cannot update this inbox."}

      {:inbox, _} ->
        {:error, :not_found, "Inbox not found"}

      {:error, changeset} ->
        {:error, :unprocessable_entity, changeset_errors_to_string(changeset)}
    end
  end
end
