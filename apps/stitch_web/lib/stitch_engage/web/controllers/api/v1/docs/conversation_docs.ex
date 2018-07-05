defmodule Stitch.Web.Api.V1.ConversationDocs do
  use PhoenixSwagger
  alias Stitch.Web.Api.V1.Docs.CommonParams

  defmacro __using__(_) do
    quote do
      swagger_path :index do
        get("/api/v1/inboxes/{inbox_id}/conversations")
        produces("application/json")

        description(
          "Lists 20 most recently updated conversations for an inbox. Pass in updated_before to move backward in time."
        )

        CommonParams.auth()

        parameters do
          inbox_id(:path, :integer, "Inbox ID", required: true, example: 3)

          updated_before(
            :query,
            :string,
            "Later bound for updated_at time for conversations."
          )

          open(
            :query,
            :boolean,
            "Pass boolean to get only open or closed conversations.",
            example: false
          )
        end

        response(200, "OK", Schema.ref(:Conversations))
      end

      swagger_path :patient_index do
        get("/api/v1/patient/inboxes/{inbox_id}/conversations")
        produces("application/json")

        description(
          "Lists 20 most recently updated conversations for a patient in an inbox. Pass in updated_before to move backward in time."
        )

        CommonParams.auth()

        parameters do
          inbox_id(:path, :integer, "Inbox ID", required: true, example: 3)

          updated_before(
            :query,
            :string,
            "Later bound for updated_at time for conversations."
          )
        end

        response(200, "OK", Schema.ref(:PatientConversations))
      end

      swagger_path :patient_show do
        get("/api/v1/patient/conversations/{conversation_id}")
        produces("application/json")

        description("Shows a patient conversation with latest messages.")

        CommonParams.auth()

        parameters do
          conversation_id(:path, :integer, "Conversation ID", required: true, example: 3)
        end

        response(200, "OK", Schema.ref(:PatientConversation))
      end
    end
  end
end
