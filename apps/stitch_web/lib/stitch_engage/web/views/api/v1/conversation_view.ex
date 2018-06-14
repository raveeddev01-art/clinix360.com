defmodule StitchEngage.Web.Api.V1.ConversationView do
  use Stitch.Web, :view
  alias Stitch.Web.Api.V1.TeamPatientView
  alias StitchEngage.Web.Api.V1.ConversationMessageView

  def render("index.json", %{conversations: conversations}) do
    Enum.map(conversations, &conversation_json/1)
  end

  def render("show.json", %{conversation: conversation}) do
    conversation_json(conversation)
  end

  defp conversation_json(conversation) do
    patient_json =
      case(conversation.team_patients) do
        [team_patient | _] ->
          TeamPatientView.team_patient_json(team_patient)

        [] ->
          nil
      end

    latest_messages_json =
      ConversationMessageView.conversation_messages_json(conversation.conversation_messages)

    %{
      id: conversation.id,
      slug: conversation.slug,
      open: conversation.open,
      patient: patient_json,
      latest_messages: latest_messages_json
    }
  end
end
