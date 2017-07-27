defmodule StitchConnect.Web.Api.V1.UserController do
  use StitchConnect.Web, :controller
  plug StitchConnect.Plug.ApiAuthenticate when action in [:index, :send_invite]

  def index(conn, _) do
    users = Stitch.UserQueries.users_for_team(conn.assigns.current_user.team_id)
    render conn, "index.json", users: users
  end

  def create(conn, %{"email" => email}) do
    case Stitch.Accounts.create_user_with_email_only(email) do
      {:error, message} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: message})
      user ->
        conn
        |> put_session(:user_id, user.id)
        |> json(%{id: user.id, email: user.email, onboarded: user.onboarded})
    end
  end

  def send_confirmation_code(conn, %{"id" => id}) when is_integer(id) do
    case Stitch.User.Onboarding.send_confirmation_code(id) do
      {:error, message} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: message})
      _ ->
        conn
        |> json(%{message: "Confirmation code sent."})
    end
  end

  def submit_confirmation_code(conn, %{"user_id" => user_id, "confirmation_code" => confirmation_code}) do
    case Stitch.User.Onboarding.verify_confirmation_code(user_id, confirmation_code) do
      true ->
        conn
        |> json(%{message: "Confirmation code accepted."})
      false ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "The confirmation code is incorrect."})
    end
  end

  def complete_onboarding(conn, %{"id" => id, "fullname" => fullname, "username" => username, "password" => password, "pin" => pin, "team_id" => team_id}) do
    case Stitch.Accounts.update_and_complete_user_onboarding(id, %{fullname: fullname, username: username, password: password, pin: pin, team_id: team_id, roles: ["admin"]}) do
      {:error, message} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: message})
      user ->
        conn
        |> json(%{id: user.id, email: user.email, onboarded: user.onboarded})
    end
  end

  def send_invite(conn, %{"email" => email}) do
    # TODO
  end
end
