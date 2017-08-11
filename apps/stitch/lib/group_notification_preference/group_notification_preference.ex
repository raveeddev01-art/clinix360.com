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

  @doc """
  Returns the notification preference for a user given a group id.
  """
  def get_for_user(group_id, user_id) do
    query =
      from g in GroupNotificationPreference,
      where: g.group_id == ^group_id,
      where: g.user_id == ^user_id,
      select: g
    case Repo.one(query) do
      nil ->
        {:error, "This user has no notification preferences for this group."}
      group_notification_preference ->
        {:ok, group_notification_preference}
    end
  end

  @doc """
  Updates the user's group notification preference.
  """
  def update_for_user(group_id, user_id, setting) do
    attrs = %{setting: setting}
    query =
      from g in GroupNotificationPreference,
      where: g.group_id == ^group_id,
      where: g.user_id == ^user_id,
      select: g
    preference = Repo.one(query)
    changeset = GroupNotificationPreference.changeset(preference, attrs)

    case Repo.update(changeset) do
      {:ok, preference} ->
        {:ok, preference}
      {:error, reason} ->
        {:error, "Setting value is invalid"}
    end
  end
end
