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

  def generate_link_previews(%Message{text_content: text_content} = message) do
    link_preview_params =
      text_content
      |> get_links
      |> Enum.map(fn link ->
        generate_link_preview_param(link)
      end)

    changeset = message_changeset(message, %{
      link_previews_generated: true,
      link_previews: link_preview_params
    })

    Stitch.Repo.update!(changeset)
  end

  def generate_link_preview_param(link) do
    case HTTPoison.get(link) do
      {:ok, response} ->
        html = response.body
        title = og_metadata(html, "title")
        description = og_metadata(html, "description")
        image_url = og_metadata(html, "image")

        %{
          link: link,
          title: title,
          description: description,
          image_url: image_url
        }

      {:error, _error} ->
        nil
    end
  end

  defp message_changeset(%Message{} = message, params) do
    message
    |> cast(params, [:link_previews_generated])
    |> cast_embed(:link_previews)
    |> validate_required([:link_previews_generated, :link_previews])
  end

  defp og_metadata(html, property) do
    html
    |> Floki.attribute("meta[property='og:#{property}']", "content")
    |> List.first
  end
end
