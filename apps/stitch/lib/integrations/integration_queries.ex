defmodule Stitch.IntegrationQueries do
  @moduledoc """
  Module in charge of all integration related queries.
  """

  alias Stitch.{Repo, Integration}

  def find_by_id(id) do
    Repo.get(Integration, id)
  end

  def find_by_webhook_token(webhook_token) do
    Repo.get_by(Integration, webhook_token: webhook_token)
  end
end
