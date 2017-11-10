defmodule Stitch.Message.LinkPreview do
  use Ecto.Schema
  import Ecto.Changeset
  alias Stitch.Message

  @primary_key false
  embedded_schema do
    field :link, :string, primary: true
    field :title
    field :description
    field :image_url
  end

  def changeset(%__MODULE__{} = link_preview, params) do
    link_preview
    |> cast(params, [:link, :title, :description, :image_url])
    |> validate_required([:link])
    |> resolve_relative_image_url
  end

  defp resolve_relative_image_url(%Ecto.Changeset{
    valid?: true,
    changes: %{image_url: image_url}
  } = changeset) when is_binary(image_url) do
    link = Map.get(changeset.changes, :link, changeset.data.link)
    image_url = URI.merge(link, image_url) |> URI.to_string
    put_change(changeset, :image_url, image_url)
  end
  defp resolve_relative_image_url(changeset), do: changeset

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
