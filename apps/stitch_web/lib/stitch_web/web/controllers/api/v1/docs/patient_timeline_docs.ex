defmodule Stitch.Web.Api.V1.PatientTimelineDocs do
  use PhoenixSwagger
  alias Stitch.Web.Api.V1.Docs.CommonParams

  defmacro __using__(_) do
    quote do
      swagger_path :conversations_with_patient do
        get("/api/v1/patient_conversations/{patient_id}")
        produces("application/json")

        description("""
        Returns a sorted list of the patient conversations (with latest_conversation_message).
        """)

        CommonParams.auth()

        parameters do
          patient_id(:path, :integer, "Patient ID", required: true, example: 3)
        end

        response(200, "OK", Schema.ref(:Conversation))
      end
    end
  end
end
