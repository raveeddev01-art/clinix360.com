defmodule Stitch.MigrateReactions do
  @moduledoc """

  ```
  sh> mix run apps/stitch/priv/repo/scripts/migrate_reactions.exs
  ```

  """
  use Ecto.Migration

  alias Stitch.Message
  alias Stitch.Message.Reaction
  alias Stitch.Repo

  import Ecto.Query
  import Ecto.Changeset
  require Logger

  def run do
    Message
    |> Stitch.ChunkStream.chunk(1)
    |> Stream.each(fn
      [%{reactions: reactions} = message] when map_size(reactions) == 0 ->
        reactions =
          Reaction
          |> where(message_id: ^message.id)
          |> Repo.all()

        if Enum.any?(reactions) do
          existing_user_ids =
            reactions
            |> Enum.map(& &1.user_id)
            |> ensure_existing_user_ids()

          group_reactions =
            reactions
            |> Enum.group_by(& &1.user_id, & &1.emoji_name)
            |> Enum.filter(fn {user_id, _} ->
              Enum.member?(existing_user_ids, user_id)
            end)
            |> Map.new()

          message
          |> change(reactions: group_reactions)
          |> Repo.update()
        end

      _ ->
        nil
    end)
    |> Stream.run()
  end

  def ensure_existing_user_ids(user_ids) do
    Stitch.Accounts.User
    |> where([u], u.id in ^user_ids)
    |> select([u], u.id)
    |> Repo.all()
  end
end

Stitch.MigrateReactions.run()
