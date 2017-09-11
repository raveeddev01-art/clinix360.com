defmodule StitchConnect.Web.Api.V1.UserController do
  use StitchConnect.Web, :controller
  plug StitchConnect.Plug.ApiAuthenticate when action in [:search, :index, :send_invite, :update,
                                              :deactivate, :promote_admin, :revoke_admin]
  plug StitchConnect.Plug.TeamAdminOnly when action in [:deactivate, :promote_admin, :revoke_admin]

  alias Stitch.{Repo, Accounts.User, UserQueries}

  def index(conn, _) do
    users = UserQueries.users_for_team(conn.assigns.current_user.team_id)
    render conn, "index.json", users: users
  end

  def search(conn, %{"term" => term}) do
    result_users = UserQueries.search(conn.assigns.current_user.id, term)
    render conn, "index.json", users: result_users
  end

  def deactivate(conn, %{"id" => id}) do
    case String.to_integer(id) == conn.assigns.current_user.id do
      true ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "You cannot deactivate your own account."})
      false ->
        {:ok, user} = Stitch.Accounts.Admin.deactivate(id)
        conn
        |> json(%{message: "Account has been deactivated."})
    end
  end

  def update(conn, params) do
    case Stitch.Accounts.Admin.update_user(conn.assigns.current_user.id, params) do
      {:ok, user} ->
        conn
        |> render("update.json", user: user)
      {:error, _} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Couldn't update #{Enum.join(Map.keys(params), ", ")}"})
    end
  end

  def promote_admin(conn, %{"id" => user_id}) do
    case Stitch.Accounts.Admin.promote_admin(conn.assigns.current_user, user_id) do
      {:ok, user} ->
        conn
        |> render("show.json", user: user)
      {:error, message} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: message})
    end
  end

  def revoke_admin(conn, %{"id" => user_id}) do
    case Stitch.Accounts.Admin.revoke_admin(conn.assigns.current_user, user_id) do
      {:ok, user} ->
        conn
        |> render("show.json", user: user)
      {:error, message} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: message})
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

  def show(conn, %{"id" => id}) do
    case Repo.get(User, id) do
      nil ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "No user found with ID: #{id}"})

       user -> render conn,"show.json", user: user
     end
  end

  def update_password(conn, %{"id" => id, "new_password" => new_password, "old_password" => old_password}) do
    case Stitch.Accounts.update_user_password(String.to_integer(id),old_password,new_password) do
      {:ok, user} ->
        conn |> json(%{email: user.email, password: user.password_hash})
      {:error, message} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: message})
    end
  end

  def update_avatar(conn, %{"id" => id, "profile_image_url" => profile_image_url}) do
    changeset = Repo.get(User, id) |> User.changeset(%{profile_image_url: profile_image_url})

    case Repo.update(changeset) do
      {:ok, user} ->
        conn |> json(%{profile_image_url: user.profile_image_url})
      {:error, _} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Cannot change the user avatar"})
    end
  end

  def delete_avatar(conn, %{"id" => id}) do
    changeset = Repo.get(User, id) |> Ecto.Changeset.change(profile_image_url: nil)

    case Repo.update(changeset) do
      {:ok, _} -> conn |> send_resp(:ok, "")

      {:error, _} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Cannot delete the user avatar"})
    end
  end

  def send_invite(conn, %{"email" => email}) do
    # TODO
  end

  def exists?(conn, %{"email" => email}) do
    team_id = conn.private[:team_id]
    case Stitch.UserQueries.team_member_with_email(team_id, email) do
      %User{} -> json(conn, %{exists: true})
      _ -> json(conn, %{exists: false})
    end
  end
end
