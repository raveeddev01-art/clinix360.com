defmodule Stitch.Files.EngageFileAuthorization do
  alias Stitch.{
    Files.EngageUpload,
    Accounts.User,
    Patient
  }

  @spec can_view?(EngageUpload.t(), User.t()) :: boolean
  def can_view?(%EngageUpload{provider_id: provider_id}, %User{id: provider_id}), do: true

  def can_view?(%EngageUpload{team_id: team_id}, %User{team_id: team_id}), do: true

  def can_view?(
        %EngageUpload{team_id: team_id} = engage_upload,
        %Patient{team_id: team_id} = patient
      ) do
    !!Stitch.Files.FileQueries.get_patient_upload(patient, engage_upload)
  end

  def can_view?(_engage_upload, _user), do: false
end
