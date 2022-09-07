defmodule StitchConnect.Web.Api.V1.UserStatsController do
  use Stitch.Web, :controller

  alias Stitch.MessageQueries
  alias Stitch.GroupQueries
  alias Stitch.Files.Upload

  def unread(conn, %{"user_id" => user_id}) do
    messages = MessageQueries.user_unread_messages(user_id)
    render(conn, "unread.json", messages: messages)
  end

  def starred(conn, %{"user_id" => user_id}) do
    messages = MessageQueries.user_starred_messages(user_id)
    render(conn, "starred.json", starred_messages: messages)
  end

  def groups(conn, %{"user_id" => user_id}) do
    user_groups = GroupQueries.get_groups(user_id)
    render(conn, "user_groups.json", user_groups: user_groups)
  end

  def files(conn, %{"user_id" => user_id}) do
    files = Upload.user_uploads(user_id)
    render(conn, "user_uploads.json", files: files)
  end
end
