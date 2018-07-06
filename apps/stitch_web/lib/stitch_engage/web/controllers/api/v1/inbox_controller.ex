defmodule StitchEngage.Web.Api.V1.InboxController do
  use Stitch.Web, :controller
  use Stitch.Web.Api.V1.InboxDocs

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
  def default(conn, _params) do
    do_default(conn, conn.assigns.current_user, "show.json")
  end

  def patient_default(conn, _params) do
    do_default(conn, conn.assigns.patient, "patient_show.json")
  end

  defp do_default(conn, user_or_patient, json_name) do
    team = conn.assigns.team

    with {:inbox, inbox} when not is_nil(inbox) <- {:inbox, InboxQueries.default_for_team(team)},
         {:authorized?, true} <-
           {:authorized?, InboxAuthorization.can_view?(inbox, user_or_patient)} do
      inbox = InboxQueries.with_show_values(inbox, user_or_patient)
      render(conn, json_name, %{inbox: inbox})
    else
      {:authorized?, false} -> {:error, :not_authorized, "You cannot view this inbox."}
      {:inbox?, _} -> {:error, :not_found, "Inbox not found"}
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
