defmodule StitchConnect.Web.Api.V1.MessageView do
  use StitchConnect.Web, :view
  alias Stitch.{Message, AWS.S3}
  import StitchConnect.Web.SubdomainRouter.Helpers

  @endpoint StitchConnect.Web.Endpoint

  def render("index.json", %{messages: messages}) do
    Enum.map(messages, &message_json/1)
  end

  def render("show.json", %{message: message}) do
    message_json(message)
  end

  def message_json(message) do
    %{
      id: message.id,
      user_id: message.user_id,
      user: user_info(message),
      group_id: message.group_id,
      deleted: message.deleted,
      text_content: message.text_content,
      fields: render_fields(message),
      type: message.type,
      inserted_at: message.inserted_at,
      starred: Map.get(message, :starred, :false),
      pinned: message.pinned,
      pinned_by: pinned_by_info(message),
      pinned_at: message.pinned_at,
      edited: !!message.edited_at,
      edited_at: message.edited_at,
      read_status: message.read_status,
      reactions_web: Map.get(message, :reactions, %{}),
      mentioned_user_ids: message.mentioned_user_ids,
      link_previews: message.link_previews,
      request_id: message.request_id
    }
  end

  def user_info(%{user: user}) do
    %{ id: user.id, first_name: user.first_name, last_name: user.last_name }
  end

  def pinned_by_info(%{pinned_by_id: nil}), do: nil
  def pinned_by_info(%{pinned_by: pinned_by}) do
    %{ id: pinned_by.id, first_name: pinned_by.first_name, last_name: pinned_by.last_name }
  end

  def render_fields(%Message{id: message_id, type: "upload", fields: %{"url" => url} = fields}) when is_map(fields) and is_binary(url) do
    fields
    |> put_preview_presigned_url
    |> put_download_link(message_id)
  end
  def render_fields(%Message{fields: fields}), do: fields

  def put_download_link(fields, message_id) do
    Map.merge(fields, %{
      "url" => message_path(@endpoint, :download, message_id),
      "api_url" => api_v1_message_path(@endpoint, :download, message_id),
    })
  end

  def put_preview_presigned_url(%{"preview_url" => url, "mimetype" => "image/" <> _image} = fields) do
    case S3.presign(url) do
      {:ok, presigned_url} -> Map.put(fields, "preview_url", presigned_url)
      :error -> fields
    end
  end
  def put_preview_presigned_url(%{"url" => url, "mimetype" => "image/" <> _image} = fields) do
    case S3.presign(url) do
      {:ok, presigned_url} -> Map.put(fields, "preview_url", presigned_url)
      :error -> fields
    end
  end
  def put_preview_presigned_url(fields), do: fields
end
