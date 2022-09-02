defmodule StitchConnect.Web.Api.V1.UserStatsController do
  use Stitch.Web, :controller

  alias Stitch.MessageQueries

  def unread(conn, %{"user_id" => user_id}) do
    messages = MessageQueries.user_unread_messages(user_id)
    IO.inspect(messages)
    render(conn, "unread.json", messages: messages)
  end
end
