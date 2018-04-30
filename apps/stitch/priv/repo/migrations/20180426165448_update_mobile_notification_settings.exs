defmodule Stitch.Repo.Migrations.UpdateMobileNotificationSettings do
  use Ecto.Migration
  alias Stitch.Repo
  alias Stitch.Accounts.User
  alias Stitch.GroupUser

  @disable_ddl_transaction true

  def up do
    Repo.transaction(fn ->
      User
      |> Repo.stream()
      |> Stream.each(fn user ->
        user
        |> Ecto.Changeset.change(mobile_notification_preference: user.desktop_notification_preference)
        |> Repo.update
      end)
      |> Stream.run()
    end, timeout: :infinity)

    Repo.transaction(fn ->
      GroupUser
      |> Repo.stream()
      |> Stream.each(fn group_user ->
        group_user
        |> Ecto.Changeset.change(mobile_notification_preference: group_user.desktop_notification_preference)
        |> Repo.update
      end)
      |> Stream.run()
    end, timeout: :infinity)
  end

  def down do
  end
end
