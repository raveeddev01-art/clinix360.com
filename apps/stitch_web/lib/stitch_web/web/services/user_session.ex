defmodule Stitch.Web.UserSession do
  defstruct token: nil, locked: false

  alias Stitch.{
    Accounts.User,
    Patient,
    Web.UserSession
  }

  @type t :: %UserSession{
          token: String.t() | nil,
          locked: boolean
        }

  @spec new(User.t() | Patient.t()) :: UserSession.t()
  def new(user_or_patient) do
    %UserSession{token: user_or_patient.token}
  end

  @spec lock(UserSession.t()) :: UserSession.t()
  def lock(%UserSession{} = user_session) do
    %{user_session | locked: true}
  end

  @spec unlock(UserSession.t()) :: UserSession.t()
  def unlock(%UserSession{} = user_session) do
    %{user_session | locked: false}
  end

  @spec update_token(UserSession.t(), User.t() | Patient.t()) :: UserSession.t()
  def update_token(%UserSession{} = user_session, user_or_patient) do
    %{user_session | token: user_or_patient.token}
  end
end
