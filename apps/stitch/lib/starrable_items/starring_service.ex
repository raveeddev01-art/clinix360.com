defmodule Stitch.StarrableItems.StarringService do
  use Ecto.Schema

  alias Stitch.{
    Accounts.User,
    Files.FileQueries,
    Files.Upload,
    Message,
    MessageAction,
    Repo
  }

  @spec toggle_star(Upload.t() | Message.t(), User.t()) ::
          {boolean, {:ok, MessageAction.t()}} | {boolean, {:error, Ecto.Changeset.t()}}

  def toggle_star(%Message{type: "file_share"} = message, user) do
    upload = FileQueries.get_by_id(message.upload_id)
    toggle_star(upload, user)
  end

  def toggle_star(starrable_item, user) do
    case get_star(starrable_item, user) do
      nil ->
        {true, star(starrable_item, user)}

      %MessageAction{} = message_action ->
        {false, unstar(message_action)}
    end
  end

  @spec get_star(Upload.t() | Message.t(), User.t()) :: MessageAction.t() | nil

  def get_star(%Upload{} = upload, user) do
    Repo.get_by(MessageAction, upload_id: upload.id, user_id: user.id)
  end

  def get_star(%Message{} = message, user) do
    Repo.get_by(MessageAction, message_id: message.id, user_id: user.id)
  end

  @spec star(Upload.t() | Message.t(), User.t()) ::
          {:ok, MessageAction.t()} | {:error, Ecto.Changeset.t()}

  def star(%Upload{} = upload, %User{} = user) do
    %MessageAction{upload: upload, user: user, category: "star"}
    |> Repo.insert()
  end

  def star(%Message{} = message, %User{} = user) do
    %MessageAction{message: message, user: user, category: "star"}
    |> Repo.insert()
  end

  @spec unstar(MessageAction.t()) :: {:ok, MessageAction.t()} | {:error, Ecto.Changeset.t()}
  def unstar(message_action) do
    Repo.delete(message_action)
  end
end
