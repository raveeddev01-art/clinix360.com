defmodule Stitch.Analytics.Team do
  @moduledoc """
  Manage team analytics logic
  """

  @analytics Application.get_env(:stitch, :analytics)

  @doc """
  Updates Team Identification information in analytics
  """
  def identify_and_group(team) do
    Stitch.Task.start fn ->
      @analytics.identify_and_group(team)
    end
  end
end
