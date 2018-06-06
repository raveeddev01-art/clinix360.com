defmodule StitchConnect.Web.Api.V1.MessageView do
  use StitchConnect.Web, :view
  alias Stitch.{Message, AWS.S3}
  import StitchConnect.Web.SubdomainRouter.Helpers

  @endpoint StitchConnect.Web.Endpoint

  def render("index.json", %{messages: messages} = opts) do
    authenticated_urls = Map.get(opts, :authenticated_urls, false)
    Enum.map(messages, &message_json(&1, authenticated_urls, files_endpoint()))
  end

  def render("starred.json", %{message: message, user_id: user_id}) do
    message_json(message)
    |> Map.put(:starred_by_user_id, user_id)
  end

  def render("show.json", %{message: message}) do
    message_json(message)
  end

  def render("feed_surrounding.json", %{
        more_before: more_before,
        more_after: more_after,
        messages: messages
      }) do
    %{
      more_before: more_before,
      more_after: more_after,
      messages: render("index.json", %{messages: messages})
    }
  end

  def render("mark_as_read.json", %{messages_json: messages_json, group_user: group_user}) do
    %{
      messages: messages_json,
      group_id: group_user.group_id,
      last_read_at: group_user.last_read_at,
      mentions_count: group_user.mentions_count,
      unread_messages_count: group_user.unread_messages_count
    }
  end

  def message_json(message), do: message_json(message, false, files_endpoint())

  def message_json(message, authenticated_url, file_endpoint) do
    %{
      id: message.id,
      user_id: message.user_id,
      user: user_info(message),
      group_id: message.group_id,
      deleted: message.deleted,
      text_content: message.text_content,
      fields: render_fields(message, authenticated_url, file_endpoint),
      type: message.type,
      inserted_at: message.inserted_at,
      updated_at: message.updated_at,
      starred: Map.get(message, :starred, false),
      pinned_by_id: message.pinned_by_id,
      pinned: message.pinned,
      pinned_by: pinned_by_info(message),
      pinned_at: message.pinned_at,
      edited: !!message.edited_at,
      edited_at: message.edited_at,
      read_status: message.read_status,
      reactions_web: Map.get(message, :reactions, %{}),
      mentioned_user_ids: message.mentioned_user_ids,
      link_previews: message.link_previews,
      request_id: message.request_id,
      highlighted_text_content: message.highlighted_text_content
    }
  end

  def user_info(nil), do: nil

  def user_info(%{user: %Ecto.Association.NotLoaded{}}), do: nil

  def user_info(%{user: user}) do
    %{id: user.id, first_name: user.first_name, last_name: user.last_name}
  end

  def pinned_by_info(%{pinned_by_id: nil}), do: nil

  def pinned_by_info(%{pinned_by: %Ecto.Association.NotLoaded{}}), do: nil

  def pinned_by_info(%{pinned_by: pinned_by}) do
    %{id: pinned_by.id, first_name: pinned_by.first_name, last_name: pinned_by.last_name}
  end

  def render_fields(
        %Message{id: message_id, type: "upload", fields: %{"url" => url} = fields},
        authenticated_urls,
        files_endpoint
      )
      when is_map(fields) and is_binary(url) do
    fields
    |> put_preview_presigned_url(authenticated_urls, message_id, files_endpoint)
    |> put_download_link(authenticated_urls, message_id, files_endpoint)
  end

  def render_fields(%Message{fields: fields}, _authenticated_urls, _files_endpoint), do: fields

  def put_download_link(fields, true, message_id, files_endpoint) do
    filename = Map.get(fields, "filename", fn -> Stitch.Rand.token(8) end)
    url = files_file_url(files_endpoint, :stream, message_id, filename)

    Map.merge(fields, %{
      "url" => url,
      "api_url" => api_v1_message_path(@endpoint, :download, message_id)
    })
  end

  def put_download_link(fields, false, message_id, _files_endpoint) do
    Map.merge(fields, %{
      "url" => message_path(@endpoint, :download, message_id),
      "api_url" => api_v1_message_path(@endpoint, :download, message_id)
    })
  end

  def put_preview_presigned_url(
        %{"mimetype" => "image/" <> _image} = fields,
        true,
        message_id,
        files_endpoint
      ) do
    url = files_file_url(files_endpoint, :stream_preview, message_id)
    Map.put(fields, "preview_url", url)
  end

  def put_preview_presigned_url(
        %{"mimetype" => "image/" <> _image} = fields,
        false,
        message_id,
        _files_endpoint
      ) do
    url = Map.get(fields, "preview_url") || Map.get(fields, "url")

    case S3.presign(url) do
      {:ok, presigned_url} -> Map.put(fields, "preview_url", presigned_url)
      :error -> fields
    end
  end

  def put_preview_presigned_url(fields, _authenticated_urls, _message_id), do: fields

  defp files_endpoint do
    struct_url = StitchConnect.Web.Endpoint.struct_url()
    %{struct_url | host: "files.#{struct_url.host}"}
  end
end
