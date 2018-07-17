defmodule Stitch.Web.Api.V1.AuthenticationView do
  use Stitch.Web, :view
  alias Stitch.Accounts.PasswordResetToken

  @spec reset_password_link(PasswordResetToken.t(), Plug.Conn.t()) :: binary
  def reset_password_link(%PasswordResetToken{token: token, user_id: user_id}, conn)
      when not is_nil(user_id) do
    base_url(conn) <> "/reset-password/#{token}"
  end

  def reset_password_link(%PasswordResetToken{token: token, patient_id: patient_id}, conn)
      when not is_nil(patient_id) do
    base_url(conn) <> "/patient/reset-password/#{token}"
  end

  defp base_url(conn) do
    case Application.get_env(:stitch_web, :env) do
      :dev -> "https://#{conn.host}:#{conn.port}"
      _ -> "https://#{conn.host}"
    end
  end
end
