defmodule Stitch.Web.Api.V1.MessagesHelper do
  @moduledoc """
  Used by ConservationMessageView and MessageView for rendering fields attr.
  """
  alias Stitch.{
    AWS.S3,
    Files.Upload,
    Web.UrlService
  }

  @endpoint Stitch.Web.Endpoint

  # use Stitch.Web, :view
  import Stitch.Web.SubdomainRouter.Helpers

  def render_fields(%{fields: nil}, _authenticated_urls, _files_endpoint), do: nil

  def render_fields(%{fields: fields} = message, authenticated_urls, files_endpoint) when is_list(fields) do
    Enum.map(fields, fn upload ->
      message
      |> Map.merge(%{upload_id: upload["id"]})
      |> Map.merge(%{fields: upload})
      |> render_fields(authenticated_urls, files_endpoint)
    end)
  end

  def render_fields(%{type: "upload"} = message, authenticated_urls, files_endpoint) do
    IO.inspect(message, label: "type upload")
    message.fields
    |> put_preview_presigned_url(authenticated_urls, message.id, files_endpoint)
    |> put_download_link(authenticated_urls, message.id, files_endpoint)
  end

  def render_fields(%{type: "file_share"} = message, false, files_endpoint) do
    IO.inspect(message, label: "false auth urls")
    message.fields
    |> put_preview_presigned_url(false, message.id, files_endpoint)
    |> put_download_link(false, message.id, files_endpoint)
  end

  def render_fields(%{type: "file_share"} = message, true, files_endpoint) do
    IO.inspect(message, label: "true auth urls")
    IO.inspect(files_endpoint, label: "files endpoint")
    encoded_file_id = Upload.encode_url_id(%Upload{id: message.upload_id})
    filename = Map.get(message.fields, "filename", fn -> Stitch.Rand.token(8) end)
    url = files_file_url(files_endpoint, :download, encoded_file_id, filename)
    # preview_url = files_file_url(files_endpoint, :download_preview, encoded_file_id)

    message.fields
    |> put_preview_presigned_url(false, message.id, files_endpoint)
    |> Map.merge(%{
      "url" => url,
      "api_url" => api_v1_message_path(@endpoint, :download, message.id),
      "public_url" => get_public_token(message)
    })
  end

  def render_fields(%{fields: fields}, _authenticated_urls, _files_endpoint), do: fields

  defp put_upload_id(nil, _upload_id), do: nil
  defp put_upload_id(fields, upload_id) do
    fields
    |> Map.merge(%{"id" => upload_id})
  end

  defp put_download_link(fields, true, message_id, files_endpoint) do
    filename = Map.get(fields, "filename", fn -> Stitch.Rand.token(8) end)
    url = files_file_url(files_endpoint, :download, message_id, filename)

    Map.merge(fields, %{
      "url" => url,
      "api_url" => api_v1_message_path(@endpoint, :download, message_id)
    })
  end

  defp put_download_link(fields, false, message_id, _files_endpoint) do
    Map.merge(fields, %{
      "url" => message_path(@endpoint, :download, message_id),
      "api_url" => api_v1_message_path(@endpoint, :download, message_id)
    })
  end

  defp put_preview_presigned_url(
         %{"mimetype" => "image/" <> _image} = fields,
         true,
         message_id,
         files_endpoint
       ) do
    url = files_file_url(files_endpoint, :download_preview, message_id)
    Map.put(fields, "preview_url", url)
  end

  defp put_preview_presigned_url(
         %{"mimetype" => "image/" <> _image} = fields,
         false,
         _message_id,
         _files_endpoint
       ) do
    url = Map.get(fields, "preview_url") || Map.get(fields, "url")

    case S3.presign(url) do
      {:ok, presigned_url} -> Map.put(fields, "preview_url", presigned_url)
      :error -> fields
    end
  end

  defp put_preview_presigned_url(
         %{"mimetype" => "application/pdf"} = fields,
         true,
         message_id,
         files_endpoint
       ) do
    url = files_file_url(files_endpoint, :download_preview, message_id)
    Map.put(fields, "preview_url", url)
  end

  defp put_preview_presigned_url(
         %{"mimetype" => "application/pdf"} = fields,
         false,
         _message_id,
         _files_endpoint
       ) do
    url = Map.get(fields, "preview_url") || Map.get(fields, "url")

    case S3.presign(url) do
      {:ok, presigned_url} -> Map.put(fields, "preview_url", presigned_url)
      :error -> fields
    end
  end

  defp put_preview_presigned_url(
         %{"mimetype" => "application/" <> _document} = fields,
         true,
         message_id,
         files_endpoint
       ) do
        url = files_file_url(files_endpoint, :download_preview, message_id)
        Map.put(fields, "preview_url", url)

  end

  defp put_preview_presigned_url(
         %{"mimetype" => "application/" <> _document} = fields,
         false,
         _message_id,
         _files_endpoint
       ) do
      url = Map.get(fields, "preview_url") || Map.get(fields, "url")

      case S3.presign(url) do
        {:ok, presigned_url} -> Map.put(fields, "preview_url", presigned_url)
        :error -> fields
      end
  end

  defp put_preview_presigned_url(fields, _authenticated_urls, _message_id, _files_endpoint),
    do: fields

  def get_public_token(message) do
    if token = message.fields["public_token"] do
      UrlService.public_download_page(%Upload{id: message.upload_id}, token)
    else
      nil
    end
  end
end
