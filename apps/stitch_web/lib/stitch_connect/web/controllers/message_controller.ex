defmodule StitchConnect.Web.MessageController do
  use Stitch.Web, :controller

  def download(conn, %{"id" => message_id}) do
    current_user = conn.assigns.current_user
    message = MessageQueries.get_by_id(message_id)

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
