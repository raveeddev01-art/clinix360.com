defmodule Stitch.Message.LinkPreview do
  use Ecto.Schema
  alias Stitch.Message

  @primary_key false
  embedded_schema do
    field :link, :string, primary: true
    field :title
    field :description
    field :image_url
  end

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
