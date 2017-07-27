defmodule StitchConnect.Web.Api.V1.UserController do
  use StitchConnect.Web, :controller
  plug StitchConnect.Plug.ApiAuthenticate when action in [:index, :send_invite]
  alias Stitch.Accounts

  def index(conn, _) do
    users = Stitch.UserQueries.users_for_team(conn.assigns.current_user.team_id)
    render conn, "index.json", users: users
  end

  def update(conn, %{"first_name" => first_name, "last_name" => last_name}) do
    case Stitch.Accounts.Admin.update_firstname_and_lastname(conn.assigns.current_user.id, first_name, last_name) do
      {:error, message} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Couldn't update first_name and last_name"})
      {:ok, user} ->
        conn
        |> json(%{
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name
        })
    end
  end

  def update(conn, %{"phone_number" => phone_number}) do
    case Stitch.Accounts.Admin.update_phone_number(conn.assigns.current_user.id, phone_number) do
      {:error, message} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Couldn't update phone_number"})
      {:ok, user} ->
        conn
        |> json(%{
          id: user.id,
          phone_number: user.phone_number
        })
    end
  end

  def update(conn, %{"title" => title}) do
    case Stitch.Accounts.Admin.update_title(conn.assigns.current_user.id, title) do
      {:error, message} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Couldn't update title"})
      {:ok, user} ->
        conn
        |> json(%{
          id: user.id,
          title: user.title
        })
    end
  end

  def update(conn, %{"profile_image_url" => profile_image_url}) do
    case Stitch.Accounts.Admin.update_profile_image_url(conn.assigns.current_user.id, profile_image_url) do
      {:error, message} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Couldn't update profile image url"})
      {:ok, user} ->
        conn
        |> json(%{
          id: user.id,
          profile_image_url: user.profile_image_url
        })
    end
  end

  def update(conn, %{"username" => username}) do
    case Stitch.Accounts.Admin.update_username(conn.assigns.current_user.id, username) do
      {:error, message} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Couldn't update username"})
      {:ok, user} ->
        conn
        |> json(%{
          id: user.id,
          username: user.username
        })
    end
  end

  def update(conn, %{"email" => email}) do
    case Stitch.Accounts.Admin.update_email(conn.assigns.current_user.id, email) do
      {:error, message} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Couldn't update email"})
      {:ok, user} ->
        conn
        |> json(%{
          id: user.id,
          email: user.email
        })
    end
  end

  def update(conn, %{"password" => password}) do
    case Stitch.Accounts.Admin.update_password(conn.assigns.current_user.id, password) do
      {:error, message} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Couldn't update password"})
      {:ok, user} ->
        conn
        |> json(%{
          id: user.id,
          password: user.password
        })
    end
  end

  def update(conn, %{"pin" => pin}) do
    case Stitch.Accounts.Admin.update_pin(conn.assigns.current_user.id, pin) do
      {:error, message} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Couldn't update pin"})
      {:ok, user} ->
        conn
        |> json(%{
          id: user.id,
          pin: user.pin
        })
    end
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

  def complete_onboarding(conn, %{"id" => id, "first_name" => first_name, "last_name" => last_name, "username" => username, "password" => password, "pin" => pin, "team_id" => team_id}) do
    case Stitch.Accounts.update_and_complete_user_onboarding(id, %{first_name: first_name, last_name: last_name, username: username, password: password, pin: pin, team_id: team_id, roles: ["admin"]}) do
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
