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
        render conn, StitchConnect.Web.Api.V1.UserView, "login.json", user: user
    end
  end

  # NOTE: This is just for testing in tsung. Obv. never merge it.
  def stress_login(conn, %{"email" => email}) do
    team_slug = conn.private[:team_slug]
    # FIXME: Hardcoded local care-clinic ID for now
    team_id = 1

    password = "Somepass1234!"
    username = Regex.replace(~r/@/, email, "")
    case Stitch.Accounts.create_and_complete_user_onboarding(%{
      email: email,
      password: password,
      first_name: "Joe",
      last_name: "Test",
      username: username,
      pin: "0000",
      roles: ["admin"],
      team_id: team_id
    }) do
      {:error, reason} ->
        IO.puts "zomg error: #{inspect reason}"
        conn
      user ->
        conn
        |> json(%{id: user.id, token: user.token, team_id: user.team_id})
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
        Stitch.Accounts.Email.reset_password_email(user, StitchConnect.Web.Api.V1.AuthenticationView.reset_password_link(user, conn))
        conn |> json(%{resetToken: user.password_reset_token})
    end
  end

  def reset_password(conn, %{"token" => token, "password" => password}) do
    case Stitch.User.Authentication.reset_password_for_user(token, password) do
      {:error, message} ->
        conn
        |> put_status(403)
        |> json(%{message: message})
      {:ok, _} ->
        conn |> json(%{message: "Password was successfully changed"})
    end
  end
end
