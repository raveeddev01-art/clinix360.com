defmodule Stitch.NewsQueries do
  alias Stitch.Repo
  alias Stitch.News
  import Ecto.Query

  @doc """
  Returns a list of all News stories for Stitch

  ## Examples

      iex> Stitch.NewsQueries.all_news()
      [%Stitch.News{...}]

  """
  def all_news do
    query =
      from(
        n in News,
        order_by: [desc: n.inserted_at],
        select: n
      )

    Repo.all(query)
  end
end
