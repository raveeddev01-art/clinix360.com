defmodule StitchConnect.Web.Api.V1.AuthenticationView do
  use StitchConnect.Web, :view
  alias Stitch.Accounts.PasswordResetToken

  @spec reset_password_link(PasswordResetToken.t, Plug.Conn.t) :: binary
  def reset_password_link(%PasswordResetToken{} = password_reset_token, conn) do
    case Application.get_env(:stitch_connect, :env) do
      :dev -> "https://#{conn.host}:#{conn.port}/reset-password/#{password_reset_token.token}"
      _ -> "https://#{conn.host}/reset-password/#{password_reset_token.token}"
    end
  end
end
