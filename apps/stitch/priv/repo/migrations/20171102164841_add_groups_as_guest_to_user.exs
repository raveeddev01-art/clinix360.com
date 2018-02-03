defmodule Stitch.Repo.Migrations.AddGroupsAsGuestToUsers do
  @moduledoc false

  use Ecto.Migration

  @doc """
  This field is being added for guest users. We will have list
  of allowed groups here for every guest user or have empty array
  for regular "Members" and "Admins".
  """
  def change do
    alter table(:users) do
      add :groups_as_guest, {:array, :integer}, default: []
    end
  end
end
