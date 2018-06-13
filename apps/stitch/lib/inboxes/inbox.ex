defmodule Stitch.Engage.Inbox do
  @moduledoc """
  The Inbox schema module.
  """

  use Ecto.Schema
  alias Stitch.Team
  alias Stitch.Engage.{InboxProvider}

  @type t :: %__MODULE__{}

  schema "inboxes" do
    belongs_to(:team, Team)
    has_many(:inbox_providers, InboxProvider)
    has_many(:providers, through: [:inbox_providers, :provider])

    field(:name, :string)
    field(:is_default, :boolean, default: false)

    timestamps()
  end
end
