defmodule Stitch.Exports do
  @moduledoc """
  This module includes functions for handling data exports.
  """
  require Logger
  import Ecto.Query
  alias Stitch.{Repo, Team, AWS.S3, Accounts.User}
  alias Stitch.Exports.{Export, TeamHistory, UserExport}
  alias Stitch.Web.EventsChannel
  @exports_enabled Application.get_env(:stitch, Stitch.Exports)[:enabled]

  @doc """
  Creates an export.

  ## Example

      iex> create_export(%Team{...})
      {:ok, %Export{...}}

  """
  @spec create_export(Team.t()) :: {:ok, Export.t()} | {:error, Ecto.Changeset.t()}
  def create_export(%Team{id: team_id}) do
    %{team_id: team_id}
    |> Export.new()
    |> Repo.insert()
  end

  def create_user_export(%Team{} = team, %User{} = user) do
    UserExport.create(team, user, %{})
  end

  @doc """
  Lists all exports for a given team and type.

  ## Example

      iex> list_exports(%Team{...})
      [%Export{...}, ...]

  """
  @spec list_exports(Team.t()) :: [Export.t()]
  def list_exports(%Team{id: team_id}) do
    query =
      from(
        e in Export,
        where: e.team_id == ^team_id,
        order_by: [asc: e.inserted_at]
      )

    Repo.all(query)
  end

  def list_user_exports(%Team{} = team) do
    UserExport
    |> where(team_id: ^team.id)
    |> order_by(asc: :inserted_at)
    |> preload(:user)
    |> Repo.all()
  end

  def get_export([id: _, team_id: _] = clauses) do
    Repo.get_by(Export, clauses)
  end

  def get_user_export([id: _, team_id: _] = clauses) do
    Repo.get_by(UserExport, clauses)
  end

  @doc """
  Updates an export.

  ## Example

      iex> update_export(%Export{...}, %{status: "COMPLETE"})
      {:ok, %Export{...}}

  """
  @spec update_export(Team.t(), map) :: {:ok, Export.t()} | {:error, Ecto.Changeset.t()}
  def update_export(%Export{} = export, params) do
    export
    |> Export.update(params)
    |> Repo.update()
  end

  def update_export(%UserExport{} = user_export, params) do
    user_export
    |> UserExport.update(params)
  end

  @doc """
  Spawns a process (not linked to caller) to complete an export request.

  Not enabled on test env.

  """
  @spec schedule_export(Team.t(), Export.t()) :: {:ok, pid} | :ignore
  def schedule_export(%Team{} = team, export) do
    if @exports_enabled do
      Task.Supervisor.start_child(Stitch.Exports.Supervisor, __MODULE__, :start_export, [
        team,
        export
      ])
    else
      :ignore
    end
  end

  @doc """
  Exports team history data to S3 and updates export status in database.

  Steps to complete an export:
  1. Create a zip archive containing JSON data for a given team.
  2. Upload zip to S3.
  3. Delete zip archive from disk.
  4. Update export record with status 'COMPLETE' and the zip url from S3.

  """
  @spec start_export(Team.t(), Export.t()) :: {:ok, Export.t()} | {:error, term}
  def start_export(%Team{} = team, export) do
    try do
      do_start_export(team, export)
    rescue
      e ->
        Logger.error("Failed to complete export for team id #{inspect(team.id)}. #{inspect(e)}")
        EventsChannel.broadcast_export_finished(team, export.id, "FAILED")
        update_export(export, %{status: "FAILED"})
    end
  end

  defp do_start_export(%Team{} = team, %Export{} = export) do
    with {:ok, zip_path} <- TeamHistory.generate_zip(team, :timer.hours(5)),
         {:ok, _} <- S3.upload(zip_path),
         :ok <- File.rm(zip_path) do
      zip_url = S3.fullpath(zip_path)
      Stitch.Web.EventsChannel.broadcast_export_finished(team, export.id, "COMPLETE")
      update_export(export, %{status: "COMPLETE", zip_url: zip_url})
    else
      error ->
        Logger.error("Failed to complete export for team id #{team.id}: #{error}")
        Stitch.Web.EventsChannel.broadcast_export_finished(team, export.id, "FAILED")
        update_export(export, %{status: "FAILED"})
    end
  end

  defp do_start_export(%Team{} = team, %UserExport{} = export) do
    with user <- Stitch.UserQueries.get_by_id(export.user_id),
         {:ok, zip_path} <- TeamHistory.generate_zip(team, :timer.hours(5), %{user: user}),
         {:ok, _} <- S3.upload(zip_path),
         :ok <- File.rm(zip_path) do
      zip_url = S3.fullpath(zip_path)
      Stitch.Web.EventsChannel.broadcast_user_export_finished(team, export.id, "COMPLETE")
      update_export(export, %{status: "COMPLETE", zip_url: zip_url})
    else
      error ->
        Logger.error("Failed to complete export for team id #{team.id}: #{error}")
        Stitch.Web.EventsChannel.broadcast_user_export_finished(team, export.id, "FAILED")
        update_export(export, %{status: "FAILED"})
    end
  end

  @doc """
    Returns true if no exports have been created for a given team in the last 24
    hours, false otherwise.
  """

  @spec authorized_to_create_export?(Team.t()) :: boolean
  def authorized_to_create_export?(%Team{} = team) do
    result =
      Export
      |> where(team_id: ^team.id)
      |> where(status: "PROCESSING")
      |> where([e], e.inserted_at > ago(1, "day"))
      |> Repo.all()

    result == []
  end

  def clean_outdated(%Team{} = team) do
    Export
    |> where(team_id: ^team.id)
    |> where(status: "PROCESSING")
    |> where([e], e.inserted_at <= ago(1, "day"))
    |> Repo.delete_all()
  end

  @spec authorized_to_create_user_export?(User.t(), User.t()) :: boolean
  def authorized_to_create_user_export?(current_user, target_user) do
    result =
      Export
      |> where(team_id: ^target_user.team_id)
      |> where(status: "PROCESSING")
      |> where([e], e.inserted_at > ago(1, "day"))
      |> Repo.all()

    current_user.team_id == target_user.team_id and "admin" in current_user.roles and result == []
  end

  def clean_outdated_user_exports(%Team{} = team, %User{} = user) do
    UserExport
    |> where(team_id: ^team.id)
    |> where(user_id: ^user.id)
    |> where(status: "PROCESSING")
    |> where([e], e.inserted_at <= ago(1, "day"))
    |> Repo.delete_all()
  end
end
