defmodule Stitch.AppQueries do
  alias Stitch.Repo
  alias Stitch.App

  @doc """
  Returns a list of all available Apps in Stitch.

  ## Examples

      iex> Stitch.AppQueries.catalog()
      [%Stitch.App{id: 1, name: "drchrono", slug: "drchrono"...}]

  """
  def catalog do
    Repo.all(App)
  end

  @doc """
  Returns an App struct given an app id.

  ## Examples

      iex> Stitch.AppQueries.get_by_id(1)
      %Stitch.App{id: 1, name: "drchrono", slug: "drchrono"...}
  """
  @spec get_by_id(number) :: App.t() | nil
  def get_by_id(app_id) when is_number(app_id) do
    Repo.get(App, app_id)
  end

  def get_by_id(_), do: {:error, "App id must be an integer"}
end
