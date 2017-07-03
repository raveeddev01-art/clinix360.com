defmodule StitchConnect.Web.Api.V1.UserController do
  use StitchConnect.Web, :controller

  def create(conn, %{"email" => email}) do
    case Stitch.User.Onboarding.create_user_with_email(email) do
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

  # def update(conn, %{"id" => id, "password" => password}) do
  #   user = Stitch.UserQueries.get_by_id(id)
  #   if user.onboarded == true do
  #     conn
  #     |> put_status(:unprocessable_entity)
  #     |> json(%{message: "Can't update password for an already onboarded user."})
  #   else
  #     case Stitch.User.Authentication.update_password(id, password) do
  #       true ->
  #         conn
  #         |> json(%{message: "Password updated."})
  #       _ ->
  #         conn
  #         |> put_status(:unprocessable_entity)
  #         |> json(%{message: "Could not update the user's password"})
  #     end
  #   end
  # end
end
