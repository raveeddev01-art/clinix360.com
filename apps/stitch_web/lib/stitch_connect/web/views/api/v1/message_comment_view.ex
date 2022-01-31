defmodule StitchConnect.Web.Api.V1.MessageCommentView do
  use Stitch.Web, :view

  def render("index.json", %{message_comments: message_comments}) do
    Enum.map(message_comments, &message_comment/1)
  end

  def render("show.json", %{message_comment: message_comment}), do: message_comment(message_comment)

  def message_comment(message_comment) do
    %{
      id: message_comment.id,
      text_content: message_comment.text_content,
      fields: message_comment.fields,
      user_id: message_comment.user_id,
      inserted_at: message_comment.inserted_at
    }
  end
end
