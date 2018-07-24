defmodule Stitch.Web.Api.V1.FileCommentView do
  use Stitch.Web, :view

  def render("index.json", %{file_comments: file_comments}) do
    Enum.map(file_comments, &file_comment/1)
  end

  def render("show.json", %{file_comment: file_comment}), do: file_comment(file_comment)

  def file_comment(file_comment) do
    %{
      id: file_comment.id,
      text_content: file_comment.text_content,
      fields: file_comment.fields,
      user_id: file_comment.user_id,
      inserted_at: file_comment.inserted_at
    }
  end
end
