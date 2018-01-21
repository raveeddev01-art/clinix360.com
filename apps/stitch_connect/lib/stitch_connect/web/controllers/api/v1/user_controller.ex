defmodule StitchConnect.Web.Api.V1.UserController do
  use StitchConnect.Web, :controller
  alias Stitch.Accounts.{User, Role}
  alias Stitch.{UserQueries, FeatureGateway}
  alias StitchConnect.Web.{TeamChannel, GroupChannel}

  action_fallback StitchConnect.Web.Api.V1.FallbackController

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
      TeamChannel.broadcast_activated(conn.assigns.team, String.to_integer(id))
      json(conn, %{message: "Account has been activated."})
    else
      {:error, :not_found} ->
        not_found_error(conn)
      {:self, :true} ->
        unprocessable_entity_error(conn, %{message: "You cannot activate your own account."})
    end
  end

  def deactivate(conn, %{"id" => id}) do
    with {:self, false} <- {:self, conn.assigns.current_user.id == String.to_integer(id)},
         {:ok, _user} <- Stitch.Accounts.Admin.deactivate(conn.assigns.team, id) do
      Stitch.Billing.update_subscriber_count(conn.assigns.team)
      TeamChannel.broadcast_deactivated(conn.assigns.team, String.to_integer(id))
      json(conn, %{message: "Account has been deactivated."})
    else
      {:error, :not_found} ->
        not_found_error(conn)
      {:self, :true} ->
        unprocessable_entity_error(conn, %{message: "You cannot deactivate your own account."})
    end
  end

  def update(conn, params) do
    with {:ok, user} <- Stitch.Accounts.Admin.update_user(conn.assigns.current_user.id, params) do
      TeamChannel.broadcast_user_info(conn.assigns.team, user)
      render(conn, "update.json", user: user)
    end
  end

  def promote_admin(conn, %{"id" => user_id}) do
    case Stitch.Accounts.Admin.promote_admin(conn.assigns.current_user, user_id) do
      {:ok, user} ->
        TeamChannel.broadcast_user_info(conn.assigns.team, user)
        conn
        |> render("show.json", user: user)
      {:error, message} ->
        conn
        |> unprocessable_entity_error(%{message: message})
    end
  end

  def revoke_admin(conn, %{"id" => user_id}) do
    case Stitch.Accounts.Admin.revoke_admin(conn.assigns.current_user, user_id) do
      {:ok, user} ->
        TeamChannel.broadcast_user_info(conn.assigns.team, user)
        conn
        |> render("show.json", user: user)
      {:error, message} ->
        conn
        |> unprocessable_entity_error(%{message: message})
    end
  end

  def create(conn, %{"email" => email}) do
    case Stitch.Accounts.create_user_with_email_only(email) do
      {:error, message} ->
        conn
        |> unprocessable_entity_error(%{message: message})
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
        |> unprocessable_entity_error(%{message: message})
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
        |> unprocessable_entity_error(%{message: "The confirmation code is incorrect."})
    end
  end

  def complete_onboarding(conn, params) do
    {id, params} = Map.pop(params, "id")
    params = Map.put(params, "roles", ["admin"])

    case Stitch.Accounts.update_and_complete_user_onboarding(id, params) do
      {:error, changeset} ->
        conn
        |> unprocessable_entity_error(%{changeset: changeset})
      user ->
        group = Stitch.GroupQueries.default_group(user)
        Stitch.Group.add_user(group, user.id)
        Stitch.Group.assign_creator(group, user.id)
        conn
        |> login_user(user)
        |> json(%{id: user.id, email: user.email, onboarded: user.onboarded})
    end
  end

  def show(conn, %{"id" => id}) do
    case Stitch.Accounts.get_for_team_id(id, conn.assigns.current_user.team_id) do
      nil -> conn |> unprocessable_entity_error(%{message: "No user found with ID: #{id}"})
      user -> render conn, "show.json", user: user
    end
  end

  def update_password(conn, %{"id" => _id, "new_password" => new_password, "old_password" => old_password}) do
    case Stitch.Accounts.update_user_password(conn.assigns.current_user.id, old_password, new_password) do
      {:ok, user} ->
        conn |> json(%{email: user.email, password: user.password_hash})
      {:error, message} ->
        conn |> unprocessable_entity_error(%{message: message})
    end
  end

  def validate_phone_number(conn, %{"phone_number" => phone_number}) do
    case Stitch.Twilio.lookup(phone_number) do
      :ok ->
        conn |> json(%{status: "ok"})
      :error ->
        conn |> unprocessable_entity_error(%{message: "Phone number is invalid."})
    end
  end

  def request_demo(conn, %{"fullName" => full_name, "email" => email, "phoneNumber" => phone_number, "companyName" => company}) do
    properties = %{
      "full_name"     => full_name,
      "email"         => email,
      "phone_number"  => phone_number,
      "company"       => company,
    }

    Stitch.Analytics.track("Requested Demo", properties)
    json(conn, %{status: "ok"})
  end

  def upload_profile_image(conn, %{"url" => url}) do
    case Stitch.Accounts.update_profile_image(conn.assigns.current_user, url) do
      {:ok, user} ->
        conn |> render("show.json", user: user)
      {:error, changeset} ->
        conn |> unprocessable_entity_error(%{changeset: changeset})
    end
  end

  def delete_profile_image(conn, _params) do
    case Stitch.Accounts.delete_profile_image(conn.assigns.current_user) do
      {:ok, user} ->
        conn |> render("show.json", user: user)
      {:error, _error} ->
        conn |> unprocessable_entity_error(%{changeset: "Couldn't delete the profile image"})
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

  def validate_username(conn, %{"username" => username}) do
    params = %{username: username, team_id: conn.private[:team_id]}
    json(conn, User.username_changeset(%User{}, params).valid?)
  end

  def validate_username(conn, _) do
    conn
    |> put_status(:bad_request)
    |> json(%{message: "Requires a username query."})
  end

  @member_role Role.member()
  @guest_roles Role.guests()
  def change_role(conn, %{"id" => user_id, "role" => role}) when role in @member_role do
    do_change_role(conn, %{user_id: user_id, role: role})
  end
  def change_role(conn, %{"id" => user_id, "role" => role, "group_ids" => group_ids})
    when role in @guest_roles do
      with :ok <- FeatureGateway.allowed?(:guests, conn.assigns.subscription) do
        do_change_role(conn, %{user_id: user_id, role: role, groups_as_guest: group_ids})
      else
        error -> handle_change_role_error(conn, error, role)
      end
  end

  defp do_change_role(conn, %{user_id: user_id, role: role} = params) do
    with team = conn.assigns.team,
        {:user, user} when not is_nil(user) <- {:user, UserQueries.team_member_by_id(team, user_id)},
        {:ok, updated_user} <- Stitch.Accounts.Admin.change_role(user, params),
        {:admins, team_admins} = {:admins, Stitch.TeamQueries.list_admins(team)},
        {added_groups, removed_groups} = Stitch.Accounts.Admin.update_user_group_memberships(updated_user) do
      Stitch.Billing.update_subscriber_count(team)
      TeamChannel.broadcast_user_info(team, user)
      GroupChannel.broadcast_members_update(user, added_groups, removed_groups)
      send_role_changed_email(team_admins, user, updated_user)

      json(conn, %{message: "User role updated."})
    else
      error -> handle_change_role_error(conn, error, role)
    end
  end

  defp send_role_changed_email(team_admins, user, updated_user) do
    if user.roles != updated_user.roles do
      Enum.each(team_admins, fn admin ->
        Stitch.Accounts.Email.role_changed_email(admin, user.roles, updated_user.roles)
      end)
    end
  end

  defp handle_change_role_error(conn, {:user, nil}, _) do
    not_found_error(conn)
  end
  defp handle_change_role_error(conn, {:insufficient_tier, _}, _) do
    unprocessable_entity_error(conn, %{message: "Feature not available for your subscription."})
  end
  defp handle_change_role_error(conn, {:error, :invalid_group_ids}, _) do
    unprocessable_entity_error(conn, %{message: "One or more provided group ids is invalid."})
  end
  defp handle_change_role_error(conn, {:error, :invalid_group_size}, "single-room-guest") do
    unprocessable_entity_error(conn, %{message:  ~s(Expected exactly 1 group id in "group_ids" list.)})
  end
  defp handle_change_role_error(conn, {:error, :invalid_group_size}, "multi-room-guest") do
    unprocessable_entity_error(conn, %{message: ~s(Expected at least 1 group ids in "group_ids" list.)})
  end

  # TODO: Can be moved to some common helper later
  defp not_found_error(conn) do
    not_found_error(conn, "User does not exist.")
  end
  defp not_found_error(conn, %{message: message}) do
    conn
    |> put_status(:not_found)
    |> json(%{message: message})
  end

  defp unprocessable_entity_error(conn, %{changeset: changeset}) do
    message = changeset_errors_to_string(changeset)
    unprocessable_entity_error(conn, %{message: message})
  end
  defp unprocessable_entity_error(conn, %{message: message}) do
    conn
    |> put_status(:unprocessable_entity)
    |> json(%{message: message})
  end
end
