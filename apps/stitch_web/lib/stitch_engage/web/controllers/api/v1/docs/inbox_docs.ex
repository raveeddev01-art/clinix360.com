defmodule Stitch.Web.Api.V1.InboxDocs do
  use PhoenixSwagger
  alias Stitch.Web.Api.V1.Docs.CommonParams

  defmacro __using__(_) do
    quote do
      swagger_path :default do
        get("/api/v1/inboxes/default")
        produces("application/json")

        description("Return the default inbox for a team.")

        CommonParams.auth()

        response(200, "OK", Schema.ref(:Inbox))
      end

      swagger_path :patient_default do
        get("/api/v1/patient/inboxes/default")
        produces("application/json")

        description("Return the default inbox for a team.")

        CommonParams.auth()

        response(200, "OK", Schema.ref(:PatientInbox))
      end
    end
  end
end
