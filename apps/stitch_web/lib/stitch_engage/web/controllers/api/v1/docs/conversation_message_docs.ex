defmodule Stitch.Web.Api.V1.ConversationMessageDocs do
  use PhoenixSwagger
  alias Stitch.Web.Api.V1.Docs.CommonParams

  defmacro __using__(_) do
    quote do
      swagger_path :index do
        get("/api/v1/conversations/{conversation_id}/messages")
        produces("application/json")

        description(
          "List of 50 most recent conversation messages for a conversation. Pass in updated_before to move backward in time."
        )

        CommonParams.auth()

        parameters do
          conversation_id(:path, :integer, "Conversation ID", required: true, example: 3)

          updated_before(
            :query,
            :string,
            "Later bound for updated_at time for messages."
          )
        end

        response(200, "OK", Schema.ref(:ConversationMessages))
      end

      swagger_path :patient_index do
        get("/api/v1/patient/conversations/{conversation_id}/messages")
        produces("application/json")

        description(
          "List of 50 most recent conversation messages for a conversation. Pass in updated_before to move backward in time."
        )

        CommonParams.auth()

        parameters do
          conversation_id(:path, :integer, "Conversation ID", required: true, example: 3)

          updated_before(
            :query,
            :string,
            "Later bound for updated_at time for messages."
          )
        end

        response(200, "OK", Schema.ref(:ConversationMessages))
      end

      swagger_path :patient_show do
        get("/api/v1/patient/conversation_messages/{conversation_message_id}")
        produces("application/json")

        description("Show a conversation message for a patient.")

        CommonParams.auth()

        parameters do
          conversation_message_id(
            :path,
            :integer,
            "Conversation Message ID",
            required: true,
            example: 209
          )
        end

        response(200, "OK", Schema.ref(:ConversationMessage))
      end
    end
  end
end
