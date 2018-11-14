defmodule Stitch.Message.Reaction do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query

  alias Stitch.{
    Repo,
    Message,
    Accounts.User,
    Patient,
    Engage.ConversationMessage
  }

  @type t :: %__MODULE__{}

  @castable_assocs [:user_id, :message_id, :emoji_name]

  schema "reactions" do
    belongs_to(:user, User)
    belongs_to(:patient, Patient)
    belongs_to(:message, Message)
    belongs_to(:conversation_message, ConversationMessage)
    field(:emoji_name, :string)

    timestamps(updated_at: false)
  end

  def changeset(%Stitch.Message.Reaction{} = struct, params) do
    struct
    |> cast(params, @castable_assocs)
    |> validate_required([:emoji_name])
  end

  def add_reactions(reaction, user_id, emoji_name) when is_integer(user_id) do
    add_reactions(reaction, Integer.to_string(user_id), emoji_name)
  end

  def add_reactions(reaction, user_id, emoji_name) do
    Map.update(reaction, user_id, [emoji_name], fn user_reactions ->
      if Enum.member?(user_reactions, emoji_name) do
        user_reactions -- [emoji_name]
      else
        [emoji_name | user_reactions] |> Enum.uniq()
      end
    end)
  end

  def toggle_reaction(message = %Message{}, %User{} = user, emoji_name) do
    new_reactions = add_reactions(message.reactions, user.id, emoji_name)

    {1, [update_message]} =
      Message
      |> where(id: ^message.id)
      |> update([m], set: [reactions: fragment("? || ?", m.reactions, ^new_reactions)])
      |> Repo.update_all([], returning: true)

    {:ok, update_message}
  end

  @spec apply_reactions(list, atom) :: list()
  def apply_reactions(messages, :message) do
    messages
    |> Enum.map(fn
      %{reactions: message_reactions} = message ->
        grouped_reactions = group_reactions(message_reactions)
        Map.put(message, :reactions, grouped_reactions)

      message ->
        message
    end)
  end

  # reverses relation `id => [reations]` to `reaction => [ids]`
  def group_reactions(reactions) do
    Enum.reduce(reactions, %{}, fn {user_id, reactions}, acc ->
      Enum.reduce(reactions, acc, fn emoji, acc ->
        Map.update(acc, emoji, [user_id], fn user_ids ->
          [user_id | user_ids] |> Enum.uniq()
        end)
      end)
    end)
  end
end
