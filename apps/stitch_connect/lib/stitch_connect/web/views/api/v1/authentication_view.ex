defmodule StitchConnect.Web.Api.V1.AuthenticationView do
  use StitchConnect.Web, :view

  def reset_password_link(user, conn) do
    case Application.get_env(:stitch_connect, :env) do
      :dev -> "https://#{conn.host}:#{conn.port}/reset-password/#{user.password_reset_token}"
      _ -> "https://#{conn.host}/reset-password/#{user.password_reset_token}"
    end
  end
end
