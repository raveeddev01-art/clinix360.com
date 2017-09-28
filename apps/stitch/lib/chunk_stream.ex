defmodule Stitch.ChunkStream do
  import Ecto.Query

  def chunk(query, chunk_size) do
    chunk_stream = Stream.unfold(0, fn offset ->
      entries = Stitch.Repo.all(from _ in query, offset: ^offset, limit: ^chunk_size)
      {entries, offset + chunk_size}
    end)
    Stream.take_while(chunk_stream, fn [] -> false; _ -> true end)
  end
end
