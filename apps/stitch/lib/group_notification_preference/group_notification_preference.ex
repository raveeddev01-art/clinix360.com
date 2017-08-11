defmodule Stitch.GroupNotificationPreference do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Stitch.{Repo, Group, GroupNotificationPreference}
  alias Stitch.Accounts.User

  schema "group_notification_preferences" do
    belongs_to :user, Stitch.Accounts.User
    belongs_to :group, Stitch.Group
    field :setting, :string

    timestamps()
  end

  def changeset(%Stitch.GroupNotificationPreference{} = struct, params) do
    struct
    |> cast(params, [:user_id, :group_id, :setting])
    |> validate_required([:user_id, :group_id, :setting])
    |> validate_inclusion(:setting, ["everything", "mentions", "nothing"])
  end

  @doc """
  Create a notification preference for the user given a group_id
  that defaults to "mentions" if no setting parameter is sent.
  """
  def create_for_user(group_id, user_id, setting \\ "mentions") do
    attrs = %{group_id: group_id, user_id: user_id, setting: setting}
    changeset = GroupNotificationPreference.changeset(
      %GroupNotificationPreference{},
      attrs
    )
    case Repo.insert(changeset) do
      {:ok, preference} ->
        {:ok, preference}
      {:error, changeset} ->
        {:error, "Setting value is invalid"}
    end
  end
end
