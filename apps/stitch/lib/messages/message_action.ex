defmodule Stitch.MessageAction do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Stitch.{Repo, MessageAction}

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
