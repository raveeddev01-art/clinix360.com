defmodule Stitch.Web.Api.V1.Docs.CommonParams do
  alias PhoenixSwagger.Path.PathObject
  import PhoenixSwagger.Path

  def auth(path = %PathObject{}) do
    parameters path do
      authenticationToken(
        :query,
        :string,
        "token for user or patient auth",
        required: true,
        example: "f9dbVJ3l6yaGYD3Is94nrWaXd40Zxv0M"
      )
    end
  end
end

defmodule Stitch.Web.Api.V1.Docs do
  use PhoenixSwagger

  # =====================
  #   DEFINE THE MODELS
  # =====================

  def setup do
    quote do
      def swagger_definitions do
        %{
          FindTeamLogin:
            swagger_schema do
              title("FindTeamLogin")
              description("Info returned when given a find team token.")

              properties do
                teams(
                  :array,
                  "Teams to log into with name, slug, and login_token.",
                  example: [%{name: "VUMC", slug: "vumc", login_token: "djif43b9fb"}]
                )

                login_token(:string, "Token used to log into found teams.", example: "djif43b9fb")
              end
            end,
          PatientOnboardingCompletion:
            swagger_schema do
              title("PatientOnboardingCompletion")

              description("Patient info returned on successful onboard.")

              properties do
                id(:integer, "Unique identifier")
                email(:string, "Email of the patient", example: "jeff@teamstitch.com")
                onboarded(:boolean, "Whether the patient is onboarded.")
              end
            end,
          PatientInbox:
            swagger_schema do
              title("PatientInbox")

              description("A collection of conversations in Engage.")

              properties do
                id(:integer, "Unique identifier")
                name(:string, "Inbox name", example: "General")
                is_default(:boolean, "Whether the inbox is the team's default")
                conversations(Schema.ref(:ConversationMessages))
              end
            end,
          Inbox:
            swagger_schema do
              title("Inbox")

              description("A collection of conversations in Engage.")

              properties do
                id(:integer, "Unique identifier")
                name(:string, "Inbox name", required: true)
                is_default(:boolean, "Whether the inbox is the team's default")
                open_conversations(Schema.ref(:ConversationMessages))

                open_conversations_count(
                  :integer,
                  "Count of the conversations that are currently open"
                )

                open_conversations_count(
                  :integer,
                  "Count of the conversations that are currently closed"
                )
              end
            end,
          PatientConversation:
            swagger_schema do
              title("PatientConversation")

              description(
                "A conversation in Engage seen as a patient. Belongs to an inbox and contains conversation_messages."
              )

              properties do
                id(:integer, "Unique identifier")
                inbox_id(:integer, "Inbox foreign key", required: true)

                inserted_at(
                  :string,
                  "Time inserted into db",
                  example: "2018-07-03T15:58:42.059546"
                )

                subject(
                  :string,
                  "Subject line for the conversation",
                  example: "Elbow Issue",
                  required: true
                )

                updated_at(
                  :string,
                  "Last time updated in db",
                  example: "2018-07-04T15:58:42.059546"
                )

                is_unread(
                  :boolean,
                  "Whether current user has read the most recent message.",
                  example: false
                )

                latest_conversation_message(Schema.ref(:ConversationMessage))
              end
            end,
          Conversation:
            swagger_schema do
              title("Conversation")

              description(
                "A conversation in Engage. Belongs to an inbox and contains conversation_messages."
              )

              properties do
                id(:integer, "Unique identifier")
                inbox_id(:integer, "Inbox foreign key", required: true)

                open(
                  :boolean,
                  "If the conversation is open or closed",
                  example: true
                )

                subject(
                  :string,
                  "Subject line for the conversation",
                  example: "Elbow Issue",
                  required: true
                )

                inserted_at(
                  :string,
                  "Time inserted into db",
                  example: "2018-07-03T15:58:42.059546"
                )

                updated_at(
                  :string,
                  "Last time updated in db",
                  example: "2018-07-04T15:58:42.059546"
                )

                is_unread(
                  :boolean,
                  "Whether current user has read the most recent message.",
                  example: false
                )

                latest_conversation_message(Schema.ref(:ConversationMessage))
                patient(Schema.ref(:Patient))
              end
            end,
          PatientConversations:
            swagger_schema do
              title("PatientConversations")
              description("A collection of Conversations for a patient")
              type(:array)
              items(Schema.ref(:PatientConversation))
            end,
          Conversations:
            swagger_schema do
              title("Conversations")
              description("A collection of Conversations")
              type(:array)
              items(Schema.ref(:Conversation))
            end,
          ConversationMessage:
            swagger_schema do
              title("ConversationMessage")

              description(
                "The chat message in an engage conversation. Sent be either a patient or a provider."
              )

              properties do
                id(:integer, "Unique identifier")

                # RELATIONS
                conversation_id(
                  :integer,
                  "Foreign key for conversation",
                  required: true
                )

                provider_id(
                  :integer,
                  "Foreign key for provider, if sent by provider"
                )

                patient_id(
                  :integer,
                  "Foreign key for patient, if sent by patient"
                )

                upload_id(
                  :integer,
                  "Foreign key for file upload, if upload type"
                )

                user(
                  :object,
                  "Object with sender info (either provider or patient)"
                )

                # MESSAGE CONTENT

                text_content(
                  :string,
                  "The content of the message",
                  required: true,
                  example:
                    "Hi Mark, any chance we can start a video call to check your rash's reaction the medication?"
                )

                fields(
                  :object,
                  "Fields for additional information depending on message type. For instance, file uploads contain upload url in fields.",
                  example: %{
                    "url" => "/messages/1859/download",
                    "size_in_bytes" => 257_519,
                    "public" => true,
                    "preview_width" => 333,
                    "preview_url" =>
                      "https://s3.amazonaws.com/stitch-content/371320-e2c4da36-b8c2-f551-698c-fab94c914770.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIY4NBXIRIQI34S4Q%2F20180703%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20180703T174449Z&X-Amz-Expires=60000&X-Amz-SignedHeaders=host&X-Amz-Signature=0f11f61dc572183190b8726a4ea7d51c0f11836dc7ed2f177ca8a4968a05bb79",
                    "preview_height" => 720,
                    "mimetype" => "image/png",
                    "filetype" => "png",
                    "filename" => "PNG image.png",
                    "api_url" => "/api/v1/messages/1859/download"
                  }
                )

                # ATTRIBUTES

                deleted(
                  :boolean,
                  "Whether the conversation message has been deleted.",
                  example: false
                )

                type(
                  :string,
                  "The type of the message. (chat, file_share, system)",
                  example: "chat"
                )

                edited(
                  :boolean,
                  "Whether the message has been edited",
                  example: false
                )

                provider_reactions_web(
                  :object,
                  "Reactions to a message from providers, keyed by provider id. (patient reactions are in patient_reactions_web)"
                )

                patient_reactions_web(
                  :object,
                  "Reactions to a message from patients, keyed by patient id. (provider reactions are in provider_reactions_web)"
                )

                link_previews(
                  :array,
                  "List of link preview urls",
                  example: [
                    %{
                      link: "https://en.wikipedia.org/wiki/Argentina",
                      title: "Wikipedia - Argentina"
                    }
                  ]
                )

                request_id(
                  :string,
                  "Identifier for the http request that created the message",
                  example: "Skj0blreQ"
                )

                patient_read_status(
                  :object,
                  "Read status for patients. Read timestamps keyed by patient id",
                  example: %{
                    342 => "2018-06-20T22:51:19.883710",
                    225 => nil
                  }
                )

                provider_read_status(
                  :object,
                  "Read status for providers. Read timestamps keyed by provider id",
                  example: %{
                    109 => "2018-06-20T22:51:19.883710",
                    222 => nil
                  }
                )

                # TIMESTAMPS

                edited_at(
                  :string,
                  "Time that the message was last edited",
                  example: "2018-07-03T15:58:42.059546"
                )

                inserted_at(
                  :string,
                  "Time inserted into db",
                  example: "2018-07-03T15:58:42.059546"
                )

                updated_at(
                  :string,
                  "Last time updated in db",
                  example: "2018-07-03T15:58:42.059546"
                )
              end
            end,
          ConversationMessages:
            swagger_schema do
              title("ConversationMessages")
              description("A collection of ConversationMessages")
              type(:array)
              items(Schema.ref(:ConversationMessage))
            end,
          PatientLogin:
            swagger_schema do
              title("PatientLogin")
              description("A patient user.")

              properties do
                id(:integer)
                avatar_thumb(:string)
                avatar(:string)
                disabled(:boolean)
                email(:string)
                first_name(:string)
                full_name(:string)
                inserted_at(:string)
                updated_at(:string)
                last_name(:string)
                mrn(:string)
                onboarded(:booelan)
                phone(:string)
                token(:string)
                redirect_url(:string)
              end
            end,
          Patient:
            swagger_schema do
              title("Patient")
              description("A patient user.")

              properties do
                id(:integer)
                avatar_thumb(:string)
                avatar(:string)
                disabled(:boolean)
                email(:string)
                first_name(:string)
                full_name(:string)
                inserted_at(:string)
                updated_at(:string)
                last_name(:string)
                mrn(:string)
                onboarded(:booelan)
                phone(:string)
              end
            end
        }
      end
    end
  end

  defmacro __using__(which) when is_atom(which) do
    apply(__MODULE__, which, [])
  end
end
