defmodule Stitch.Engage.Conversation do
  @moduledoc """
  The Conversation schema module.
  """

  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query

  alias Stitch.Repo

  alias Stitch.Engage.{
    Inbox,
    Conversation,
    ConversationProvider,
    ConversationPatient,
    ConversationMessage
  }

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
    has_many(:team_patients, through: [:conversation_patients, :team_patient])
    has_one(:latest_conversation_message, ConversationMessage)

    timestamps()
  end

  def page_length, do: @page_length

  def changeset(%Conversation{} = struct, params) do
    struct
    |> cast(params, @castable_attributes)
    |> validate_required(@required_attributes)
  end

  @doc """
  Update updated_at to current time.
  Not using a changeset (GET and SET calls) so we can keep it quick.
  """
  def touch(id) do
    now = DateTime.utc_now() |> DateTime.to_naive()

    Conversation
    |> where(id: ^id)
    |> Repo.update_all(set: [updated_at: now])
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
          "patient_id" => patient_id
        }
      ) do
    Ecto.Multi.new()
    |> Ecto.Multi.run(:conversation, fn _ ->
      create_for_inbox(inbox_id, params)
    end)
    |> Ecto.Multi.run(:conversation_patient, fn %{conversation: conversation} ->
      ConversationPatient.create_for_conversation_and_patient(conversation.id, patient_id)
    end)
    |> Ecto.Multi.run(:conversation_providers, fn _ ->
      # ConversationProvider's will track assignment and eventually access to
      # conversations. For now, all providers will have access and assignments
      # do not exist, so this is a noop
      {:ok, []}
    end)
    |> Ecto.Multi.run(:conversation_message, fn %{conversation: conversation} ->
      ConversationMessage.create_for_provider(conversation.id, sender.id, params)
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
end
