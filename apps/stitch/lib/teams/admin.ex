defmodule Stitch.Team.Admin do
  @moduledoc """
  The Team Admin context. Operations for administering a team.
  """

  alias Stitch.Repo
  alias Stitch.Team

  @spec update_name(number, String.t) :: {:ok, term} | {:error, term}
  @doc """
  Updates the team name field.
  """
  def update_name(team_id, name) when byte_size(name) > 0 do
    team = Repo.get(Team, team_id)
    changeset = Team.changeset(team, %{name: name})
    Repo.update changeset
  end
  def update_name(_, _), do: {:error, "Name cannot be blank or nil"}

  @spec update_security_lockout_time(number, boolean, number) :: {:ok, term()} | {:error, term()}
  @doc """
  Updates the team seconds_to_lockout field, or disables it
  entirely.
  """
  def update_security_lockout_time(team_id, security_lockout, seconds_to_lockout)
  when is_number(team_id) and is_boolean(security_lockout) and is_number(seconds_to_lockout) do
    team = Repo.get(Team, team_id)
    changeset = Team.changeset(team, %{security_lockout: security_lockout, seconds_to_lockout: seconds_to_lockout})
    Repo.update changeset
  end

  def update_security_lockout_time(_, _, _), do: {:error, "Security_lockout must be a boolean, and seconds_to_lockout must be an integer."}

  def update_security_lockout_time(team_id, security_lockout)
  when is_number(team_id) and is_boolean(security_lockout) do
    team = Repo.get(Team, team_id)
    changeset = Team.changeset(team, %{security_lockout: security_lockout})
    Repo.update changeset
  end


  @spec update_open_invitation(number, boolean) :: {:ok, term} | {:error, term}
  @doc """
  Updates the team open_invitations_enabled field.
  """
  def update_open_invitation(team_id, open_invitations_enabled)
  when is_number(team_id) and is_boolean(open_invitations_enabled) do
    team = Repo.get(Team, team_id)
    changeset = Team.changeset(team, %{open_invitations_enabled: open_invitations_enabled})
    Repo.update changeset
  end

  @spec delete_team(number) :: boolean
  @doc """
  Deletes the team from the database including all associated
  records. This is *DANGEROUS* and not reversible.
  """
  def delete_team(team_id) do
    team = Repo.get(Team, team_id)
    Repo.delete team
  end

  @spec export_history(number) :: boolean | {:error, term}
  @doc """
  Generates a .zip file containing all of the data exported
  for the team. It uploads the contents to an S3 bucket which
  can only be accessed using a special associated token. Returns
  true if the export went correctly.
  """
  def export_history(_team_id) do
    # TODO
  end
end
