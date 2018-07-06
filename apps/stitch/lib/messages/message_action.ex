defmodule Stitch.MessageAction do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query

  alias Stitch.{
    Message,
    MessageAction,
    Repo
  }

  @type t :: %__MODULE__{}

  schema "message_actions" do
    belongs_to(:user, Stitch.Accounts.User)
    belongs_to(:message, Stitch.Message)
    belongs_to(:upload, Stitch.Files.Upload)
    field(:category, :string)

    timestamps()
  end

  def changeset(%Stitch.MessageAction{} = struct, params) do
    struct
    |> cast(params, [:user_id, :message_id, :upload_id, :category])
    |> validate_required([:category])
    |> unique_constraint(
      :category,
      name: :message_actions_user_id_message_id_category_index,
      message: "user_id and message_id combination isn't unique for this category"
    )
    |> unique_constraint(
      :user_id,
      name: :message_actoins_have_message_or_upload,
      message: "message_action must have either upload or message"
    )
  end

  def apply_user_message_actions(user, messages) do
    message_actions = get_user_message_actions(user, messages)
    actions_by_message_ids = message_actions |> Enum.group_by(& &1.message_id)
    actions_by_upload_id = message_actions |> Enum.group_by(& &1.upload_id)

    Enum.map(messages, fn
      %{type: "file_share"} = message ->
        case Map.get(actions_by_upload_id, message.upload_id) do
          nil ->
            message

          actions ->
            Enum.reduce(actions, message, fn
              %{category: "star"}, acc -> Map.put(acc, :starred, true)
              _, acc -> acc
            end)
        end

      message ->
        case Map.get(actions_by_message_ids, message.id) do
          nil ->
            message

          actions ->
            Enum.reduce(actions, message, fn
              %{category: "star"}, acc -> Map.put(acc, :starred, true)
              _, acc -> acc
            end)
        end
    end)
  end

  def get_user_message_actions(user, messages) do
    message_ids = messages |> Enum.map(& &1.id)

    upload_ids =
      Enum.reduce(messages, [], fn m, acc ->
        if m.upload_id && m.type == "file_share", do: [m.upload_id | acc], else: acc
      end)

    MessageAction
    |> where([ma], ma.message_id in ^message_ids or ma.upload_id in ^upload_ids)
    |> where([ma], ma.user_id == ^user.id)
    |> Repo.all()
  end

  def get_user_message_actions_map(user, messages) do
    get_user_message_actions(user, messages)
    |> Enum.group_by(& &1.message_id)
  end

  def toggle_pin(message, user) do
    if message.pinned do
      Message.unpin(message)
    else
      Message.pin(message, user)
    end
  end
end
