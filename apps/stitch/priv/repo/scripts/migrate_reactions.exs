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
          |> Enum.group_by(& &1.user_id, & &1.emoji_name)

        message
        |> change(reactions: reactions)
        |> Repo.update()

      _ ->
        nil
    end)
    |> Stream.run()
  end
end

Stitch.MigrateReactions.run()
