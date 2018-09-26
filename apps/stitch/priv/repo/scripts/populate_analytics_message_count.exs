defmodule Stitch.PopulateAnalyticsMessageCount do
  @moduledoc """
  Usage:

      mix run apps/stitch/priv/repo/scripts/populate_analytics_message_count.exs

  Counters are created in a descending order, therefore, it's safe to run this script
  second time if we want to reset the counters. (We won't count the message twice)
  """

  require Logger

  import Ecto.Query

  alias Stitch.{
    Repo
  }

  def run() do
    Stitch.AnalyticsMessageCount
    |> Repo.delete_all()

    Stitch.Message
    |> Stitch.ChunkStream.chunk_desc(100)
    |> Stream.each(fn
      [] ->
        nil

      messages ->
        Enum.each(messages, fn message ->
          Stitch.AnalyticsMessageCount.create(message)
        end)
    end)
    |> Stream.run()

    IO.puts("Finished creating analytics with message counts")
  end
end

Stitch.PopulateAnalyticsMessageCount.run()
