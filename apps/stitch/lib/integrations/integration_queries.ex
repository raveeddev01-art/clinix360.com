defmodule Stitch.IntegrationQueries do
  @moduledoc """
  Module in charge of all integration related queries.
  """

  alias Stitch.{Repo, Integration, IntegrationConfig}
  alias Stitch.Accounts.User
  import Ecto.Query

  def find_by_id(id) do
    Repo.get(Integration, id)
  end
end
