defmodule Stitch.Message.LinkPreview do
  alias Stitch.Message

  def messages_with_ungenerated_link_previews do
    import Ecto.Query, only: [where: 3]

    Message
    |> where([m], m.has_links == true)
    |> where([m], m.link_previews_generated == false)
    |> Stitch.Repo.all
  end

  def get_links(text) do
    ~r(https?://[^\s]+)
    |> Regex.scan(text)
    |> List.flatten
  end
end
