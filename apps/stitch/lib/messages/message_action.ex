defmodule Stitch.MessageAction do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Stitch.{Repo, MessageAction, Message}

  schema "message_actions" do
    belongs_to :user, Stitch.Accounts.User
    belongs_to :message, Stitch.Message
    field :category, :string

    timestamps()
  end

  def changeset(%Stitch.MessageAction{} = struct, params) do
    struct
    |> cast(params, [:user_id, :message_id, :category])
    |> validate_required([:user_id, :message_id, :category])
    |> unique_constraint(:category, name: :message_actions_user_id_message_id_category_index, message: "user_id and message_id combination isn't unique for this category")
  end

  def apply_user_message_actions(user, messages) do
    message_ids = messages |> Enum.sort_by(& &1.id)
    %{id: from_id} = message_ids |> List.first
    %{id: to_id} = message_ids |> List.last
    message_actions = get_user_message_actions_map(user, from_id, to_id)
    Enum.map(messages, fn (message) ->
      case Map.get(message_actions, message.id) do
        nil -> message
        actions ->
          Enum.reduce(actions, message, fn
            (%{category: "star"}, acc) -> Map.put(acc, :starred, true)
            (_, acc) -> acc
          end)
      end
    end)
  end

  def get_user_message_actions(user, from_message_id, to_message_id) do
    query =
      from ma in MessageAction,
      where: ma.message_id >= ^from_message_id and
             ma.message_id <= ^to_message_id and
             ma.user_id == ^user.id
    Repo.all(query)
  end

  def get_user_message_actions_map(user, from_message_id, to_message_id) do
    get_user_message_actions(user, from_message_id, to_message_id)
    |> Enum.group_by(& &1.message_id)
  end

  def toggle_pin(message, user) do
    if message.pinned do
      Message.unpin(message)
    else
      Message.pin(message, user)
    end
  end

  def toggle_star(message, user) do
    with star = get_star(message, user),
         {result, {:ok, message_action}} <- toggle_star(message, user, star) do
      {:ok, result, message_action}
    end
  end

  def toggle_star(message, user, nil), do: {true, star(message, user)}
  def toggle_star(_message, _user, star), do: {false, unstar(star)}

  def get_star(message, user) do
    Repo.get_by(MessageAction, message_id: message.id, user_id: user.id, category: "star")
  end

  def star(message, user) do
    Repo.insert(MessageAction.changeset(%MessageAction{}, %{message_id: message.id, user_id: user.id, category: "star"}))
  end

  def unstar(message_action) do
    Repo.delete(message_action)
  end
end
