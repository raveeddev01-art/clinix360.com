defmodule Stitch.Repo.Migrations.UpdateUsernameFormat do
  use Ecto.Migration

  @disable_ddl_transaction true

  import Ecto.Query
  alias Stitch.{Repo, Group, Message, GroupUser}
  alias Stitch.Accounts.User

  def up do
    groups = Repo.all(Group)

    Enum.each(groups, fn group ->
      group_user_ids = GroupUser |> where(group_id: ^group.id) |> select([gu], gu.user_id) |> Repo.all
      users = User |> where([u], u.id in ^group_user_ids) |> Repo.all |> Enum.reduce(%{}, & Map.put(&2, &1.username, &1.id))

      group_messages = Message |> where(group_id: ^group.id) |> Repo.all

      Enum.each(group_messages, fn
        %{text_content: nil} -> nil
        %{text_content: text_content} = message ->
          updated_text_content = Enum.reduce(users, text_content, fn ({username, user_id}, acc) ->
            String.replace(acc, "@#{username}", "<@U#{user_id}>")
          end)
          Repo.update(Ecto.Changeset.change(message, text_content: updated_text_content))
      end)
    end)
  end

  def down do
  end
end
