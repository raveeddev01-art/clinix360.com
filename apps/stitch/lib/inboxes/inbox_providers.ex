defmodule Stitch.Engage.InboxProvider do
  @moduledoc """
  The association between inboxes and providers.

  Initially all providers on a team will be in the inbox, but
  we will eventually allow joining/leaving and provider-inbox specific
  notifications settings.
  """

  use Ecto.Schema
  alias Stitch.{Accounts.User, Engage.Inbox}

  @type t :: %__MODULE__{}

  schema "inbox_providers" do
    belongs_to(:inbox, Inbox)
    belongs_to(:provider, User)

    timestamps()
  end
end
