defmodule Stitch.Message.Reaction do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Stitch.{Repo, Message}

  schema "reactions" do
    belongs_to :user, Stitch.Accounts.User
    belongs_to :message, Stitch.Message
    field :emoji_name, :string

    timestamps(updated_at: false)
  end

  def changeset(%Stitch.Message.Reaction{} = struct, params) do
    struct
    |> cast(params, [:user_id, :message_id, :emoji_name])
    |> validate_required([:user_id, :message_id, :emoji_name])
  end

  def apply_reactions(messages) do
    message_ids = messages |> Enum.map(& &1.id)
    query = from r in Message.Reaction, where: r.message_id in ^message_ids
    reactions = Repo.all(query) |> Enum.group_by(& &1.message_id)

    messages
    |> Enum.map(fn message ->
      message_reactions = reactions[message.id] || []
      grouped_reactions = message_reactions |> Enum.group_by(& &1.emoji_name, & &1.user_id)
      Map.put(message, :reactions, grouped_reactions)
    end)
  end

  def toggle_reaction(message, user, emoji_name) do
    reaction = Repo.get_by(Message.Reaction, user_id: user.id, message_id: message.id, emoji_name: emoji_name)
    case reaction do
      nil -> Repo.insert(Message.Reaction.changeset(%Message.Reaction{}, %{user_id: user.id, message_id: message.id, emoji_name: emoji_name}))
      reaction -> Repo.delete(reaction)
    end
  end
end
