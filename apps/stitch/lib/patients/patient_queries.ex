defmodule Stitch.PatientQueries do
  @moduledoc """
  Queries used for Patient related logic.
  """

  import Ecto.Query

  alias Stitch.{
    Repo,
    Patient,
    Engage.ConversationPatient,
    Paginator
  }

  @doc """
  Given a token and an optional query to scope results. Return patient or nil.
  """
  @spec get_by_token(Ecto.Query.t(), binary) :: Patient.t() | nil
  def get_by_token(query \\ Patient, token) do
    query
    |> where(token: ^token)
    |> limit(1)
    |> preload(:team)
    |> Repo.one()
  end

  @doc """
  Gets active and onboarded patients.
  """
  @spec active_and_onboarded(Ecto.Query.t()) :: Ecto.Query.t()
  def active_and_onboarded(query \\ Patient) do
    query
    |> where(onboarded: true)
    |> where(disabled: false)
  end

  @doc """
  Given a token, return matching patient if active and onboarded.
  """
  @spec get_active_by_token(binary) :: Patient.t() | nil
  def get_active_by_token(token) do
    get_by_token(active_and_onboarded(), token)
  end

  @doc """
  Given an invite_token (for Invitation, not a patient.token), find
  the patent associated with that invitation.
  """
  def get_by_invite_token(invite_token) do
    Patient
    |> join(:inner, [p], i in assoc(p, :invitation))
    |> where([p, i], i.invite_token == ^invite_token)
    |> Repo.one()
  end

  @doc """
  Given an email return boolean if onboarded patient with that email exists.
  """
  @spec onboarded_patient_with_email_exists?(binary) :: boolean
  def onboarded_patient_with_email_exists?(email) do
    query =
      from(
        u in Patient,
        where: u.onboarded == ^true,
        where: u.email == ^email,
        select: u.id,
        limit: 1
      )

    !!Repo.one(query)
  end

  @doc """
  Return Patient with team_id and email.
  """
  @spec team_member_with_email(integer | binary, binary) :: Patient.t() | nil
  def team_member_with_email(team_id, email) do
    Patient
    |> where(team_id: ^team_id)
    |> where(email: ^email)
    |> Repo.one()
  end

  @doc """
  Given a team id (and optional subquery), return a list of patients for a team.
  """
  @spec for_team_id(Ecto.Query.t(), number | binary) :: list(Patient.t())
  def for_team_id(query \\ Patient, team_id) do
    query |> where(team_id: ^team_id)
  end

  @spec for_team_and_email(integer, binary) :: Patient.t()
  def for_team_and_email(team_id, email) do
    Patient
    |> where(team_id: ^team_id)
    |> where(email: ^email)
    |> Repo.one()
  end

  def page_of_patients_for_team(team_id, opts \\ []) do
    limit = Keyword.get(opts, :limit, 30)
    offset = Keyword.get(opts, :skip, 0)

    team_id
    |> for_team_id()
    |> order_by([p], asc: p.first_name)
    |> Paginator.new(limit: limit, skip: offset)
  end

  @doc """
  Given a patient id, return the patient.
  """
  @spec get_patient(number | binary) :: Patient.t() | nil
  def get_patient(patient_id) do
    Patient |> where(id: ^patient_id) |> Repo.one()
  end

  @doc """
  Count of unread conversation messages given a patient id.
  """
  @spec unread_conversation_messages_count(integer | binary) :: integer | nil
  def unread_conversation_messages_count(patient_id) do
    query =
      from(
        cp in ConversationPatient,
        where: cp.patient_id == ^patient_id,
        select: sum(cp.unread_messages_count)
      )

    Repo.one(query)
  end

  @doc """
  Count of unread conversations given a patient id.
  """
  @spec unread_conversations_count(integer | binary) :: integer | nil
  def unread_conversations_count(patient_id) do
    query =
      from(
        cp in ConversationPatient,
        where: cp.patient_id == ^patient_id,
        where: cp.unread_messages_count > 0,
        select: count(cp.id, :distinct)
      )

    Repo.one(query)
  end
end
