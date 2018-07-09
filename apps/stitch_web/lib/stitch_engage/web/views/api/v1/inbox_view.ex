defmodule StitchEngage.Web.Api.V1.InboxView do
  use Stitch.Web, :view
  alias StitchEngage.Web.Api.V1.ConversationView

  def render("index.json", %{inboxes: inboxes}) do
    Enum.map(inboxes, &inbox_json/1)
  end

  def render("patient_index.json", %{inboxes: inboxes}) do
    Enum.map(inboxes, &patient_inbox_json/1)
  end

  def render("show.json", %{inbox: inbox}) do
    inbox_json(inbox)
  end

  def render("patient_show.json", %{inbox: inbox}) do
    patient_inbox_json(inbox)
  end

  defp inbox_json(inbox) do
    %{
      id: inbox.id,
      name: inbox.name,
      is_default: inbox.is_default,
      open_conversations: ConversationView.conversations_json(inbox.open_conversations),
      open_conversations_count: inbox.open_conversations_count,
      closed_conversations_count: inbox.closed_conversations_count
    }
  end

  defp patient_inbox_json(inbox) do
    %{id: inbox.id, name: inbox.name}
  end
end
