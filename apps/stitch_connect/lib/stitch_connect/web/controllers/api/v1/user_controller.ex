defmodule StitchConnect.Web.Api.V1.UserController do
  use StitchConnect.Web, :controller
  alias Stitch.{Accounts.User, UserQueries}
  alias StitchConnect.Web.{EventsChannel, TeamChannel}

  def index(conn, _) do
    users = UserQueries.users_for_team(conn.assigns.current_user.team_id)
    render conn, "index.json", users: users
  end

  def search(conn, %{"term" => term}) do
    result_users = UserQueries.search(conn.assigns.current_user.id, term)
    render conn, "index.json", users: result_users
  end

  def activate(conn, %{"id" => id}) do
    with {:self, false} <- {:self, conn.assigns.current_user.id == String.to_integer(id)},
         {:ok, _user} <- Stitch.Accounts.Admin.activate(conn.assigns.team, id) do
      Stitch.Billing.update_subscriber_count(conn.assigns.team)
      json(conn, %{message: "Account has been activated."})
    else
      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{message: "User does not exist."})
    {:self, :true} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "You cannot activate your own account."})
    end
  end

  def deactivate(conn, %{"id" => id}) do
    with {:self, false} <- {:self, conn.assigns.current_user.id == String.to_integer(id)},
         {:ok, _user} <- Stitch.Accounts.Admin.deactivate(conn.assigns.team, id) do
      Stitch.Billing.update_subscriber_count(conn.assigns.team)
      json(conn, %{message: "Account has been deactivated."})
    else
      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{message: "User does not exist."})
      {:self, :true} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "You cannot deactivate your own account."})
    end
  end

  def update(conn, params) do
    case Stitch.Accounts.Admin.update_user(conn.assigns.current_user.id, params) do
      {:ok, user} ->
        TeamChannel.broadcast_user_info(conn.assigns.team, user)
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
        EventsChannel.broadcast_user_info(user)
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
        EventsChannel.broadcast_user_info(user)
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

  def complete_onboarding(conn, %{"id" => id, "first_name" => first_name, "last_name" => last_name, "phone_number" => phone_number, "username" => username, "password" => password, "pin" => pin, "team_id" => team_id}) do
    case Stitch.Accounts.update_and_complete_user_onboarding(id, %{first_name: first_name, last_name: last_name, username: username, phone_number: phone_number, password: password, pin: pin, team_id: team_id, roles: ["admin"]}) do
      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: changeset_errors_to_string(changeset)})
      user ->
        group = Stitch.GroupQueries.default_group(user)
        Stitch.Group.add_user(group, user.id)
        conn
        |> login_user(user)
        |> json(%{id: user.id, email: user.email, onboarded: user.onboarded})
    end
  end

  def show(conn, %{"id" => id}) do
    case Stitch.Accounts.get_for_team_id(id, conn.assigns.current_user.team_id) do
      nil ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "No user found with ID: #{id}"})

       user -> render conn,"show.json", user: user
     end
  end

  def update_password(conn, %{"id" => _id, "new_password" => new_password, "old_password" => old_password}) do
    case Stitch.Accounts.update_user_password(conn.assigns.current_user.id, old_password, new_password) do
      {:ok, user} ->
        conn |> json(%{email: user.email, password: user.password_hash})
      {:error, message} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: message})
    end
  end

  def validate_phone_number(conn, %{"phone_number" => phone_number}) do
    case Stitch.Twilio.lookup(phone_number) do
      :ok ->
        conn |> json(%{status: "ok"})
      :error ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Phone number is invalid."})
    end
  end

  def send_invite(_conn, %{"email" => _email}) do
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
