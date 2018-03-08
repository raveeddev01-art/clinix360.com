defmodule Stitch.Bot do
  @moduledoc """
  Allows team Administrators to use bots that can communicate
  on the Stitch Connect application.
  """

  @doc """
  Returns a list of existing bots for a Team.
  """
  def team_bots(team_id) do
  end

  @doc """
  Creates a bot using the given bot parameters for a team.
  """
  def create(team_id, bot_params) do
  end

  @doc """
  Updates a bot's configuration including things like
  profile image, display name and more.
  """
  def update(team_id, bot_id, bot_params) do
  end

  @doc """
  Disables a bot, preventing it from communicating with
  people on the Stitch Connect platform.
  """
  def disable(team_id, bot_id) do
  end

  @doc """
  Deletes a bot entirely from a Team.
  """
  def delete(team_id, bot_id) do
  end
end
