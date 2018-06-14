defmodule StitchEngage.Web.Api.V1.InboxView do
  use Stitch.Web, :view

  def render("index.json", %{inboxes: inboxes}) do
    Enum.map(inboxes, &inbox_json/1)
  end

  def render("show.json", %{inbox: inbox}) do
    inbox_json(inbox)
  end

  defp inbox_json(inbox) do
    %{
      id: inbox.id,
      name: inbox.name,
      is_default: inbox.is_default
    }
  end
end
