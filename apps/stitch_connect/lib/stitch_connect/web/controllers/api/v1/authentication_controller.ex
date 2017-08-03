defmodule StitchConnect.Web.Api.V1.AuthenticationController do
  use StitchConnect.Web, :controller

  def submit_login(conn, %{"email" => email, "password" => password}) do
    team_slug = conn.private[:team_slug]
    case Stitch.User.Authentication.validate_email_and_password(email, password, team_slug) do
      false ->
        conn
        |> put_status(403)
        |> json(%{message: "Email or password is incorrect."})
      user ->
        conn
        |> json(%{authenticationToken: user.token})
    end
  end

  def reset_password(conn, %{"email" => email}) do
    team_slug = conn.private[:team_slug]
     case Stitch.User.Authentication.create_reset_password_token_for_user(email, team_slug) do
        {:error, message} ->
                    conn
                    |> put_status(403)
                    |> json(%{message: message})

        {:ok, user} ->
                    conn
                    |> json(%{resetToken: user.reset_password_token})
     end
  end

  def reset_password(conn, %{"token" => token, "password" => password}) do
    case Stitch.User.Authentication.reset_password_for_user(token, password) do
      {:error, message} ->
                  conn
                  |> put_status(403)
                  |> json(%{message: message})

      {:ok, _} ->
                  conn
                  |> json(%{message: "Password was successfully changed"})

    end
  end
end
