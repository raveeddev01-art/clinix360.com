defmodule Stitch.IntegrationQueries do
  @moduledoc """
  Module in charge of all integration related queries.
  """

  alias Stitch.{Repo, Integration}

  def find_by_id(id) do
    Repo.get(Integration, id)
  end
end
