defmodule Stitch.Engage.ConversationProvider do
  @moduledoc """
  The association between conversations and providers.

  This hold the association as well as assigned values
  and notifications settings.
  """

  use Ecto.Schema
  alias Stitch.{Accounts.User, Engage.Conversation}

  @type t :: %__MODULE__{}

  schema "conversation_providers" do
    belongs_to(:conversation, Conversation)
    belongs_to(:provider, User)

    field(:assigned, :boolean, default: false)

    field(:last_read_at, :naive_datetime)
    field(:unread_messages_count, :integer, default: 0)

    timestamps()
  end
end
