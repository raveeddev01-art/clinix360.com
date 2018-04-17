defmodule Stitch.AppQueries do
  @doc """
  Returns a list of all available Apps in Stitch.

  ## Examples

      iex> Stitch.AppQueries.catalog()
      [%Stitch.App{id: 1, name: "drchrono", slug: "drchrono"...}]

  """
  def catalog do
    Stitch.Repo.all(Stitch.App)
  end
end
