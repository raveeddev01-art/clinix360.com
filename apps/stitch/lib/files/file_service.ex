defmodule Stitch.Files.FileService do
  import Ecto.Query

  alias Stitch.{
    Message
  }

  def update_file_comment_messages(upload_comment_id, text_content) do
    Message
    |> where([m], m.type == ^"file_comment")
    |> where([m], m.upload_comment_id == ^upload_comment_id)
    |> update([m], set: [text_content: ^text_content])
  end
end
