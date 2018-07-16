defmodule Stitch.Web.Api.V1.ConversationMessageDocs do
  use PhoenixSwagger
  alias Stitch.Web.Api.V1.Docs.CommonParams

  defmacro __using__(_) do
    quote do
      swagger_path :index do
        get("/api/v1/conversations/{conversation_id}/messages")
        produces("application/json")

        description(
          "List of 50 most recent conversation messages for a conversation. Pass in max_id to move backward in time."
        )

        CommonParams.auth()

        parameters do
          conversation_id(:path, :integer, "Conversation ID", required: true, example: 3)

          limit(
            :query,
            :integer,
            "Number of conversation messages to return. Maximum of 50."
          )

          max_id(
            :query,
            :integer,
            "Upper bound for conversation message ids."
          )
        end

        response(200, "OK", Schema.ref(:ConversationMessages))
      end

      swagger_path :patient_index do
        get("/api/v1/patient/conversations/{conversation_id}/messages")
        produces("application/json")

        description(
          "List of 50 most recent conversation messages for a conversation. Pass in max_id to move backward in time."
        )

        CommonParams.auth()

        parameters do
          conversation_id(:path, :integer, "Conversation ID", required: true, example: 3)

          limit(
            :query,
            :integer,
            "Number of conversation messages to return. Maximum of 50."
          )

          max_id(
            :query,
            :integer,
            "Upper bound for conversation message ids."
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

      swagger_path :delete do
        PhoenixSwagger.Path.delete("/api/v1/conversation_messages/{conversation__message_id}")

        produces("application/json")
        description("Deletes a conversation message as a provider.")
        CommonParams.auth()

        parameters do
          conversation__message_id(
            :path,
            :integer,
            "Conversation Message ID",
            required: true,
            example: 209
          )
        end

        response(204, "OK")
      end

      swagger_path :create do
        post("/api/v1/conversations/{conversation_id}/messages")
        produces("application/json")

        description("Create a conversation message as a provider.")
        CommonParams.auth()

        parameters do
          conversation_id(
            :path,
            :integer,
            "Conversation ID",
            required: true,
            example: 209
          )

          message(
            :body,
            swagger_schema do
              properties do
                message(:object)
              end
            end,
            "Message to create. Must include 'text_content' attribute.",
            required: true
          )
        end

        response(200, "OK", Schema.ref(:ConversationMessage))
      end

      swagger_path :patient_create do
        post("/api/v1/patient/conversations/{conversation_id}/messages")
        produces("application/json")

        description("Create a conversation message as a patient.")

        CommonParams.auth()

        parameters do
          conversation_id(
            :path,
            :integer,
            "Conversation ID",
            required: true,
            example: 209
          )

          message(
            :body,
            swagger_schema do
              properties do
                message(:object)
              end
            end,
            "Message to create. Must include 'text_content' attribute.",
            required: true
          )
        end

        response(200, "OK", Schema.ref(:ConversationMessage))
      end

      swagger_path :patient_toggle_reaction do
        put("/api/v1/patient/conversation_messages/{id}/toggle_reaction")
        produces("application/json")

        description("Toggle a reaction for a conversation message.")

        CommonParams.auth()

        parameters do
          id(
            :path,
            :integer,
            "Conversation Message ID",
            required: true,
            example: 209
          )

          emoji_name(
            :query,
            :string,
            "Name of the emoji to toggle",
            example: "neutral-face",
            required: true
          )
        end

        response(200, "ok")
      end

      swagger_path :patient_delete_message_link_preview do
        put("/api/v1/patient/conversation_messages/{id}/delete_link_preview")
        produces("application/json")

        description("Deletes a link preview on a conversation message.")

        CommonParams.auth()

        parameters do
          id(
            :path,
            :integer,
            "Conversation Message ID",
            required: true,
            example: 209
          )

          link(
            :query,
            :string,
            "Link to remove",
            required: true,
            example: "https://en.wikipedia.org/wiki/Argentina"
          )
        end

        response(200, "ok")
      end

      swagger_path :patient_mark_as_read do
        post("/api/v1/patient/conversations/{conversation_id}/mark_as_read")
        produces("application/json")

        description("Marks a message as read as a patient.")

        CommonParams.auth()

        parameters do
          conversation_id(
            :path,
            :integer,
            "Conversation to mark as read",
            required: true,
            example: 100
          )
        end

        response(200, "ok")
      end
    end
  end
end
