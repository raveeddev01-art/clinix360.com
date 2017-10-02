defmodule Stitch.ChunkStream do
  import Ecto.Query, only: [from: 2]

  def chunk(query, chunk_size) do
    chunk_stream = Stream.unfold(0, fn
      nil ->
        {[], nil}
      last_seen_id ->
        entries = Stitch.Repo.all(from q in query,
          order_by: [asc: q.id],
          where: q.id > ^last_seen_id,
          limit: ^chunk_size)

        case entries do
          [] ->
            {entries, nil}
          entries ->
            last_seen_id = List.last(entries).id
            {entries, last_seen_id}
        end
    end)
    Stream.take_while(chunk_stream, fn [] -> false; _ -> true end)
  end
end
