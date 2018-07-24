defmodule StitchEngage.Web.Api.V1.PatientTimelineController do
  use Stitch.Web, :controller
  use Stitch.Web.Api.V1.PatientTimelineDocs

  alias Stitch.{
    Patient,
    PatientQueries,
    PatientAuthorization,
    Engage.ConversationQueries
  }

  action_fallback(Stitch.Web.Api.FallbackController)

  plug(:parse_query_params when action in [:conversations_with_patient])

  # ==============================
  #   CONVERSATIONS WITH PATIENT
  # ==============================

  def conversations_with_patient(conn, %{"id" => patient_id}) do
    current_user = conn.assigns.current_user

    with {:patient, %Patient{} = patient} <- {:patient, PatientQueries.get_patient(patient_id)},
         {:authorized?, true} <-
           {:authorized?,
            PatientAuthorization.can_view_patient_as_provider?(current_user, patient)} do
      conversations = ConversationQueries.with_patient(patient, conn.assigns.query_options)

      render(conn, "conversations_with_patient.json", conversations: conversations)
    else
      {:patient, _} -> {:error, :not_found}
      {:authorized?, _} -> {:error, :unauthorized}
    end
  end

  def parse_query_params(conn, _opts) do
    types = %{
      limit: :integer,
      skip: :integer
    }

    changeset = Ecto.Changeset.cast({%{}, types}, conn.params, Map.keys(types))
    assign(conn, :query_options, changeset.changes)
  end
end
