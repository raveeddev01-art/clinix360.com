defmodule StitchConnect.Web.MessageController do
  use StitchConnect.Web, :controller
  alias Stitch.{GroupAuthorization, MessageQueries, Message.Upload}

  def download(conn, %{"id" => message_id}) do
    current_user = conn.assigns.current_user
    message = MessageQueries.get_by_id(message_id)

    case GroupAuthorization.can_view?(message.group, current_user) do
      true ->
        case Upload.presign(message) do
          {:ok, presigned_url} ->
            redirect(conn, external: presigned_url)

          :error ->
            redirect(conn, to: "/login")
        end

      false ->
        redirect(conn, to: "/login")
    end
  end
end
