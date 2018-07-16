defmodule Stitch.Audit.UploadComment do
  def track_update({:ok, %{upload_comment: upload_comment}}, user, comment_before_edit) do
    Stitch.Version.insert(comment_before_edit, %{
      committed_by_id: upload_comment.user_id,
      source: "application"
    })

    Stitch.Version.update(upload_comment, %{committed_by_id: user.id, source: "application"})
    {:ok, upload_comment}
  end

  def track_update(result, _user, _message), do: result

  def track_delete(:ok, %{upload_comment: upload_comment} = result, user) do
    Stitch.Version.insert(upload_comment, %{
      committed_by_id: upload_comment.user_id,
      source: "application"
    })

    Stitch.Version.delete(upload_comment, %{committed_by_id: user.id, source: "application"})
    result
  end

  def track_delete(result, _user), do: result
end
