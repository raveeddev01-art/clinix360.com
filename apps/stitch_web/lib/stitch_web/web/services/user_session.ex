defmodule Stitch.Web.UserSession do
  defstruct token: nil, locked: false

  alias Stitch.{
    Accounts.User,
    Web.UserSession
  }

  @type t :: %UserSession{
          token: String.t() | nil,
          locked: boolean
        }

  @spec new(User.t()) :: UserSession.t()
  def new(%User{} = user) do
    %UserSession{token: user.token}
  end

  @spec lock(UserSession.t()) :: UserSession.t()
  def lock(%UserSession{} = user_session) do
    %{user_session | locked: true}
  end

  @spec unlock(UserSession.t()) :: UserSession.t()
  def unlock(%UserSession{} = user_session) do
    %{user_session | locked: false}
  end

  @spec update_token(UserSession.t(), User.t()) :: UserSession.t()
  def update_token(%UserSession{} = user_session, %User{} = user) do
    %{user_session | token: user.token}
  end
end
