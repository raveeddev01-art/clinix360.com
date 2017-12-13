defmodule Stitch.Message.LinkPreview do
  @moduledoc """
  Defines an embedded schema for message link previews
  and provides functions for generating them.
  """

  use Ecto.Schema
  import Ecto.Changeset
  alias Stitch.{Message, Repo}

  @primary_key false
  embedded_schema do
    field :link, :string, primary: true
    field :title
    field :description
    field :favicon_url
    field :image_url
  end

  def changeset(%__MODULE__{} = link_preview, params) do
    link_preview
    |> cast(params, [:link, :title, :description, :favicon_url, :image_url])
    |> validate_required([:link, :title])
    |> resolve_relative_favicon_url
    |> resolve_relative_image_url
  end

  defp resolve_relative_favicon_url(%Ecto.Changeset{
    valid?: true,
    changes: %{favicon_url: favicon_url}
  } = changeset) when is_binary(favicon_url) do
    link = Map.get(changeset.changes, :link, changeset.data.link)
    favicon_url = link |> URI.merge(favicon_url) |> URI.to_string
    put_change(changeset, :favicon_url, favicon_url)
  end
  defp resolve_relative_favicon_url(changeset), do: changeset

  defp resolve_relative_image_url(%Ecto.Changeset{
    valid?: true,
    changes: %{image_url: image_url}
  } = changeset) when is_binary(image_url) do
    link = Map.get(changeset.changes, :link, changeset.data.link)
    image_url = link |> URI.merge(image_url) |> URI.to_string
    put_change(changeset, :image_url, image_url)
  end
  defp resolve_relative_image_url(changeset), do: changeset

  def messages_with_ungenerated_link_previews do
    import Ecto.Query, only: [where: 3]

    Message
    |> where([m], m.has_links == true)
    |> where([m], m.link_previews_generated == false)
    |> Repo.all
  end

  def get_links(nil), do: []
  def get_links(text) when is_binary(text) do
    ~r(https?://[^\s]+)
    |> Regex.scan(text)
    |> List.flatten
  end

  def generate_link_previews(%Message{text_content: text_content} = message) do
    links = get_links(text_content)

    link_preview_params =
      if length(links) > 5 do
        []
      else
        links
        |> Enum.map(fn link ->
          generate_link_preview_param(link)
        end)
        |> Enum.reject(&is_nil/1)
      end

    changeset = message_changeset(message, %{
      link_previews_generated: true,
      link_previews: link_preview_params
    })

    Stitch.Repo.update!(changeset)
  end

  defp generate_link_preview_param(link) do
    try do
      case HTTPoison.get(link, [], follow_redirect: true) do
        {:ok, response} ->
          html = response.body
          title = title(html)

          if title do
            %{
              link: link,
              title: title,
              description: description(html),
              favicon_url: favicon_url(html),
              image_url: image_url(html)
            }
          else
            nil
          end

        {:error, _error} ->
          nil
      end
    catch
      :exit, _ -> nil
    end
  end

  defp message_changeset(%Message{} = message, params) do
    message
    |> cast(params, [:link_previews_generated])
    |> cast_embed(:link_previews)
    |> validate_required([:link_previews_generated, :link_previews])
  end

  def title(html) do
    og_metadata(html, "title") ||
      case html |> Floki.find("head > title") |> Floki.text do
        title when is_binary(title) and byte_size(title) > 0 ->
          title

        _ -> nil
      end
  end

  def description(html) do
    og_metadata(html, "description") ||
      html |> Floki.attribute("meta[name='description']", "content") |> List.first
  end

  def favicon_url(html) do
    html
    |> Floki.attribute("head link[rel~='icon']", "href")
    |> List.first
  end

  def image_url(html) do
    og_metadata(html, "image") || og_metadata(html, "image:url") || favicon_url(html)
  end

  defp og_metadata(html, property) do
    html
    |> Floki.attribute("meta[property='og:#{property}']", "content")
    |> List.first
  end

  def delete!(%Message{} = message, link) do
    link_previews = Enum.reject message.link_previews, fn link_preview ->
      link_preview.link == link
    end

    message
    |> Ecto.Changeset.change(link_previews: link_previews)
    |> Repo.update!
  end
end
