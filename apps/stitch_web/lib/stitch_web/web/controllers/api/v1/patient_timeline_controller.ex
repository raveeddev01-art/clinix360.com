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

  # ==============================
  #   CONVERSATIONS WITH PATIENT
  # ==============================

  def conversations_with_patient(conn, %{"id" => patient_id} = params) do
    current_user = conn.assigns.current_user

    with {:patient, %Patient{} = patient} <- {:patient, PatientQueries.get_patient(patient_id)},
         {:authorized?, true} <-
           {:authorized?,
            PatientAuthorization.can_view_patient_as_provider?(current_user, patient)} do
      conversations = ConversationQueries.with_patient(patient, params)

      render(conn, "conversations_with_patient.json", conversations: conversations)
    else
      {:patient, _} -> {:error, :not_found}
      {:authorized?, _} -> {:error, :unauthorized}
    end
  end
end
