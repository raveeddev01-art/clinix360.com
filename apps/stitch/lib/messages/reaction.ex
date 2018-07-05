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

  @castable_assocs [:user_id, :message_id, :conversation_message_id, :patient_id, :emoji_name]

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

  @spec toggle_reaction(ConversationMessage.t() | Message.t(), User.t(), binary) ::
          {:ok, term} | {:error, term}
  def toggle_reaction(cm = %ConversationMessage{}, %User{} = user, emoji_name) do
    params = %{
      user_id: user.id,
      conversation_message_id: cm.id,
      emoji_name: emoji_name
    }

    toggle_by_params(params)
  end

  def toggle_reaction(cm = %ConversationMessage{}, %Patient{} = patient, emoji_name) do
    params = %{
      patient_id: patient.id,
      conversation_message_id: cm.id,
      emoji_name: emoji_name
    }

    toggle_by_params(params)
  end

  def toggle_reaction(message = %Message{}, %User{} = user, emoji_name) do
    params = %{
      user_id: user.id,
      message_id: message.id,
      emoji_name: emoji_name
    }

    toggle_by_params(params)
  end

  @spec apply_reactions(list, atom) :: list()
  def apply_reactions(messages, :message) do
    message_ids = messages |> Enum.map(& &1.id)
    query = from(r in Message.Reaction, where: r.message_id in ^message_ids)
    reactions = Repo.all(query) |> Enum.group_by(& &1.message_id)

    messages
    |> Enum.map(fn message ->
      message_reactions = reactions[message.id] || []
      grouped_reactions = message_reactions |> group_by_user()
      Map.put(message, :reactions, grouped_reactions)
    end)
  end

  def apply_reactions(conversation_messages, :conversation_message) do
    conversation_message_ids = conversation_messages |> Enum.map(& &1.id)

    query =
      from(r in Message.Reaction, where: r.conversation_message_id in ^conversation_message_ids)

    reactions = Repo.all(query) |> Enum.group_by(& &1.conversation_message_id)

    conversation_messages
    |> Enum.map(fn conversation_message ->
      reactions_for_message = reactions[conversation_message.id] || []
      provider_reactions = reactions_for_message |> group_by_user()
      patient_reactions = reactions_for_message |> group_by_patient()

      conversation_message
      |> Map.put(:provider_reactions, provider_reactions)
      |> Map.put(:patient_reactions, patient_reactions)
    end)
  end

  # ===========
  #   PRIVATE
  # ===========

  defp group_by_user(list) do
    list |> group_by_column(:user_id)
  end

  defp group_by_patient(list) do
    list |> group_by_column(:patient_id)
  end

  defp group_by_column(list, column_name) do
    list
    |> Enum.filter(&(!!Map.get(&1, column_name)))
    |> Enum.group_by(& &1.emoji_name, &Map.get(&1, column_name))
  end

  defp toggle_by_params(params) do
    case Repo.get_by(Message.Reaction, params) do
      nil ->
        Repo.insert(Message.Reaction.changeset(%Message.Reaction{}, params))

      reaction ->
        Repo.delete(reaction)
    end
  end
end
