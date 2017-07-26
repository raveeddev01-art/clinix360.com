defmodule Stitch.Team.Admin do
  @moduledoc """
  The Team Admin context. Operations for administering a team.
  """

  alias Stitch.Repo

  @spec update_name(number, String.t) :: {:ok, term()} | {:error, term()}
  @doc """
  Updates the team name field.
  """
  def update_name(team_id, name) do
    # TODO
  end

  @spec update_security_lockout_time(number, boolean, number) :: {:ok, term()} | {:error, term()}
  @doc """
  Updates the team seconds_to_lockout field, or disables it
  entirely.
  """
  def update_security_lockout_time(team_id, security_lockout, seconds_to_lockout) do
    # TODO
  end

  @spec update_open_invitation(number, boolean) :: {:ok, term} | {:error, term}
  @doc """
  Updates the team open_invitation field.
  """
  def update_open_invitation(team_id, open_invitation) do
    # TODO
  end

  @spec delete_team(number) :: boolean
  @doc """
  Deletes the team from the database including all associated
  records. This is *DANGEROUS* and not reversible.
  """
  def delete_team(team_id) do
    # TODO
  end

  @spec export_history(number) :: boolean | {:error, term}
  @doc """
  Generates a .zip file containing all of the data exported
  for the team. It uploads the contents to an S3 bucket which
  can only be accessed using a special associated token. Returns
  true if the export went correctly.
  """
  def export_history(team_id) do
    # TODO
  end
end