defmodule Stitch.Analytics.TeamSnapshot do
  require Logger
  use Appsignal.Instrumentation.Decorators

  @doc """
  Creates a daily report for each team, persists event to db, cleans up data used only for snapshot.
  """
  @spec create :: any
  @decorate transaction(:background_job)
  def create do
    Logger.info("Running Team snapshot")
  end
end
