defmodule Stitch.Engage.InboxProvider do
  @moduledoc """
  The association between inboxes and providers.

  Initially all providers on a team will be in the inbox, but
  we will eventually allow joining/leaving and provider-inbox specific
  notifications settings.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias Stitch.{
    Accounts.User,
    Engage.Inbox,
    Engage.InboxProvider,
    Repo
  }

  @type t :: %__MODULE__{}

  schema "inbox_providers" do
    belongs_to(:inbox, Inbox)
    belongs_to(:provider, User)

    timestamps()
  end

  def changeset(%InboxProvider{} = struct, params \\ %{}) do
    struct
    |> cast(params, [])
    |> unique_constraint(
      :provider_id,
      name: :inbox_providers_inbox_id_provider_id_index,
      message: "provider is already part of this inbox"
    )
  end

  def create_for_team_and_provider(inbox_id, user_id) do
    %InboxProvider{inbox_id: inbox_id, provider_id: user_id}
    |> changeset()
    |> Repo.insert()
  end
end
