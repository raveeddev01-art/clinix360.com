defmodule Stitch.Engage.ConversationProvider do
  @moduledoc """
  The association between conversations and providers.

  This hold the association as well as assigned values
  and notifications settings.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias Stitch.{
    Repo,
    Accounts.User,
    Engage.Conversation,
    Engage.ConversationProvider
  }

  @type t :: %__MODULE__{}

  @castable_attributes [:assigned, :last_read_at, :unread_messages_count]
  @required_attributes []

  schema "conversation_providers" do
    belongs_to(:conversation, Conversation)
    belongs_to(:provider, User)

    field(:assigned, :boolean, default: false)

    field(:last_read_at, :naive_datetime)
    field(:unread_messages_count, :integer, default: 0)

    timestamps()
  end

  def changeset(%ConversationProvider{} = struct, params) do
    struct
    |> cast(params, @castable_attributes)
    |> validate_required(@required_attributes)
    |> unique_constraint(
      :provider_id,
      name: :conversation_providers_conversation_id_provider_id_index,
      message: "provider is already part of this conversation"
    )
  end

  @doc """
  Finds or creates ConversationProvider for user & conversation.
  """
  def insert_or_update(%Conversation{} = conversation, %User{} = user) do
    case Repo.get_by(ConversationProvider, conversation_id: conversation.id, provider_id: user.id) do
      nil ->
        %ConversationProvider{conversation_id: conversation.id, provider_id: user.id}
        |> changeset(%{})
        |> Repo.insert()

      conversation_provider ->
        {:ok, conversation_provider}
    end
  end
end
