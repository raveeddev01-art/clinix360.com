defmodule Stitch.Engage.Conversation do
  @moduledoc """
  The Conversation schema module.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias Stitch.{
    Repo,
    Invitation
  }

  alias Stitch.Engage.{
    Inbox,
    Conversation,
    ConversationProvider,
    ConversationPatient,
    ConversationMessage,
    ConversationMessage.ConversationMessageCreation
  }

  alias StitchEngage.Web.InboxChannel

  @type t :: %__MODULE__{}

  @castable_attributes [:open]
  @required_attributes []
  @page_length 20

  schema "conversations" do
    field(:open, :boolean, default: true)

    belongs_to(:inbox, Inbox)
    has_many(:conversation_messages, ConversationMessage, on_delete: :delete_all)
    has_many(:conversation_providers, ConversationProvider, on_delete: :delete_all)
    has_many(:conversation_patients, ConversationPatient, on_delete: :delete_all)
    has_many(:providers, through: [:conversation_providers, :provider])
    has_many(:patients, through: [:conversation_patients, :patient])
    has_one(:latest_conversation_message, ConversationMessage)

    timestamps()
  end

  def page_length, do: @page_length

  def changeset(%Conversation{} = struct, params) do
    struct
    |> cast(params, @castable_attributes)
    |> validate_required(@required_attributes)
  end

  def touch_changeset(%Conversation{} = struct, time) do
    struct
    |> cast(%{updated_at: time}, [:updated_at])
    |> validate_required(@required_attributes)
  end

  @doc """
  Update updated_at to current time.
  Not using a changeset (GET and SET calls) so we can keep it quick.
  """
  def touch(id, time) do
    Conversation
    |> Repo.get(id)
    |> touch_changeset(time)
    |> Repo.update()
  end

  @doc """
  Helper to create a conversation for an inbox
  """
  @spec create_for_inbox(integer | binary, map) :: {:ok, t()} | {:error, Changeset.t()}
  def create_for_inbox(inbox_id, params \\ %{}) do
    {inbox_id, _} = Integer.parse(inbox_id)

    %Conversation{inbox_id: inbox_id}
    |> changeset(params)
    |> Repo.insert()
  end

  @doc """
  Creates a conversation to a patient as a provider. Used when a provider
  sends the first message in a new conversation.
  """
  @spec begin_conversation_as_provider(User.t(), map) :: {:ok, map} | {:error, map}
  def begin_conversation_as_provider(
        sender,
        params = %{
          "inbox_id" => inbox_id,
          "patient_id" => team_patient_id
        }
      ) do
    Ecto.Multi.new()
    |> Ecto.Multi.run(:conversation, fn _ ->
      create_for_inbox(inbox_id, params)
    end)
    |> Ecto.Multi.run(:conversation_patient, fn %{conversation: conversation} ->
      ConversationPatient.create_for_conversation_and_patient(conversation.id, team_patient_id)
    end)
    |> Ecto.Multi.run(:conversation_message, fn %{conversation: conversation} ->
      {:ok, %{conversation_message: conversation_message}} =
        ConversationMessageCreation.create(conversation, sender, params)

      {:ok, conversation_message}
    end)
    |> Ecto.Multi.run(:patient_invitation, fn _multi_map ->
      Invitation.invite_patient_if_necessary(sender.id, team_patient_id)
    end)
    |> Repo.transaction()
  end

  @doc """
  Updates the open/closed value.
  """
  @spec update_open_value(t(), boolean) ::
          {:ok, map} | {:error, Changeset.t()} | {:error, :same_open_value}
  def update_open_value(%Conversation{open: open_value}, open_value) do
    {:error, :same_open_value}
  end

  def update_open_value(%Conversation{} = conversation, open_value) do
    conversation
    |> changeset(%{open: open_value})
    |> Repo.update()
  end

  @doc """
  When a conversation message is made. Update the updated_at (for sorting purposes)
  and broadcast a change with the latest message (for rendering the latest message)
  """
  def touch_and_broadcast_update(
        conversation,
        latest_conversation_message,
        time
      ) do
    case touch(conversation.id, time) do
      {:ok, touched_conversation} ->
        conversation_with_preloads =
          touched_conversation
          |> Repo.preload(:patients)
          |> Map.put(:latest_conversation_message, latest_conversation_message)

        InboxChannel.broadcast_conversation_update(conversation_with_preloads)

      other ->
        other
    end
  end

  def create_events(error), do: error
end
