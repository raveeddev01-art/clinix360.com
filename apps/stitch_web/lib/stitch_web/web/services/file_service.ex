defmodule Stitch.Web.FileService do
  alias Stitch.{
    Accounts.User,
    Files.Upload,
    Files.UploadComment
  }

  alias StitchConnect.Web.{
    MessageEventsService
  }

  @spec create_optional_comment(Upload.t(), User.t(), map, map) ::
          {:ok, UploadComment.t(), [Group.t()]} | :error

  def create_optional_comment(
        %Upload{} = upload,
        %User{} = current_user,
        presence,
        %{"text_content" => _text_content} = attrs
      ) do
    with {:ok, comment, groups} <- UploadComment.create(upload, current_user, attrs, presence) do
      Enum.each(groups, fn %{group: group, result: {:ok, result}} ->
        MessageEventsService.message_creation_events(
          result.message,
          group,
          result.notify_user_ids
        )
      end)

      {:ok, comment, groups}
    else
      _ -> :error
    end
  end

  def create_optional_comment(_upload, _current_user, _presence, _text_content), do: :error
end
