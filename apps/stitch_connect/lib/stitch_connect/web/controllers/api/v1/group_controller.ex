defmodule StitchConnect.Web.Api.V1.GroupController do
  use StitchConnect.Web, :controller
  alias Stitch.{Group, GroupQueries, GroupUser, GroupAuthorization, TeamAuthorization, MessageQueries}
  alias StitchConnect.Web.{Endpoint, EventsChannel, TeamChannel, GroupChannel}
  action_fallback StitchConnect.Web.Api.FallbackController

  def index(conn, %{"slug" => slug}) do
    user = conn.assigns.current_user
    case GroupQueries.find_by_slug(slug, user) do
      {:ok, group} ->
        render conn, "show.json", group: group, user_id: user.id
      {:error, reason} ->
        conn
        |> put_status(:not_found)
        |> json(%{message: reason})
    end
  end

  def index(conn, _params) do
    user = conn.assigns.current_user
    groups = GroupQueries.available_groups(user)
    render conn, "index.json", groups: groups, user_id: user.id
  end

  def show(conn, %{"id" => group_id}) do
    user = conn.assigns.current_user
    case GroupQueries.get_by_id(group_id, user) do
      {:ok, group} ->
        render conn, "show.json", group: group, user_id: user.id
      {:error, reason} ->
        conn
        |> put_status(:not_found)
        |> json(%{message: reason})
    end
  end

  def rename(conn, %{"id" => group_id, "name" => name}) do
    user = conn.assigns.current_user
    group = GroupQueries.get_by_id(group_id)

    case GroupAuthorization.can_rename?(group, user) do
      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Not authorized to rename this room"})
      true ->
        case Group.rename(group, name) do
          {:ok, group} ->
            group = GroupQueries.load_user_data(group, user)
            EventsChannel.broadcast_group_rename(group)
            render conn, "show.json", group: group, user_id: user.id
          {:error, reason} ->
            conn
            |> put_status(:unprocessable_entity)
            |> json(%{message: reason})
        end
    end
  end

  def users(conn, %{"id" => group_id}) do
    group = GroupQueries.get_by_id(group_id)

    case GroupAuthorization.can_view?(group, conn.assigns.current_user) do
      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Not authorized to view this room."})
      true ->
        {:ok, users} = GroupQueries.get_users(group_id)
        render(conn, StitchConnect.Web.Api.V1.UserView, "index.json", users: users)
    end
  end

  def create(conn, params) do
    user = conn.assigns.current_user
    case Group.create(params, user) do
      {:ok, %{group: group, system_messages: system_messages}} ->
        group = group
        |> Map.put_new(:joined, true)
        |> Map.put_new(:unread_messages_count, 0)
        |> Map.put_new(:is_favorite, false)
        |> Map.put_new(:is_hidden, false)
        |> Map.put_new(:last_read_at, group.inserted_at)
        |> Map.put_new(:mentions_count, 0)

        EventsChannel.broadcast_group_creation(group)
        Enum.each(system_messages, fn system_message ->
          system_message = system_message |> MessageQueries.load_info
          EventsChannel.broadcast_group_new_msg(group, system_message)
        end)

        render conn, "show.json", group: group, user_id: user.id
      {:error, {:already_exists, _slug}} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Room with given name already exists."})
      {:error, reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: reason})
    end
  end

  def create_single_dm(conn, %{"user_ids" => user_ids}) do
    case Group.create_single_dm(conn.assigns.current_user, user_ids) do
      {:error, :user_id_count_is_not_2} ->
        conn
        |> put_status(:bad_request)
        |> json(%{message: "user_ids param should contain 2 ids"})

      result -> respond_to_dm_creation(conn, result)
    end
  end

  def create_multi_dm(conn, %{"user_ids" => user_ids}) do
    case Group.create_multi_dm(conn.assigns.current_user, user_ids) do
      {:error, :user_id_count_is_not_3_or_more} ->
        conn
        |> put_status(:bad_request)
        |> json(%{message: "user_ids param should contain more than 2 ids"})

      result -> respond_to_dm_creation(conn, result)
    end
  end

  defp respond_to_dm_creation(conn, result) do
    user = conn.assigns.current_user

    case result do
      {:ok, group} ->
        group =
          group
          |> Map.put_new(:joined, true)
          |> Map.put_new(:unread_messages_count, 0)
          |> Map.put_new(:is_favorite, false)
          |> Map.put_new(:is_hidden, false)
          |> Map.put_new(:last_read_at, group.inserted_at)
          |> Map.put_new(:mentions_count, 0)

        EventsChannel.broadcast_group_creation(group)
        render conn, "show.json", group: group, user_id: user.id

      {:error, {:already_exists, slug}} ->
        {:ok, group} = GroupQueries.find_by_slug(slug, user)
        {:ok, _group_user} = Group.unhide(group, user.id)
        group = GroupQueries.load_user_data(group, user)
        render conn, "show.json", group: group, user_id: user.id

      {:error, :creator_id_is_not_in_user_ids} ->
        conn
        |> put_status(:bad_request)
        |> json(%{message: "user_ids param has to contain current user's id"})

      {:error, reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: reason})
    end
  end

  def join(conn, %{"id" => group_id}) do
    user = conn.assigns.current_user
    team = conn.assigns.team

    with {:authorized?, :true} <- {:authorized?, GroupAuthorization.can_join?(user)},
         {:group, group} when not is_nil(group) <- {:group, GroupQueries.get_by_id(team, group_id)},
         {:direct_message, false} <- {:direct_message, Group.direct_message?(group)},
         {:ok, _} <- Group.add_user(group, user) do
      # TODO: Handle broadcast in a separate PR
      # GroupChannel.broadcast_membership_changes(group, [user], [])
      json(conn, %{group_id: group.id, user_id: user.id})
    else
      {:authorized?, false} -> {:error, :not_authorized}
      {:group, nil} -> {:error, :not_found}
      {:direct_message, true} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Cannot join a direct message."})
      {:error, _} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Cannot add user to the room"})
      error -> error
    end
  end

  def leave(conn, %{"id" => group_id}) do
    user = conn.assigns.current_user
    team = conn.assigns.team

    with {:group, group} when not is_nil(group) <- {:group, GroupQueries.get_by_id(team, group_id)},
         :ok <- Group.remove_user(group, user) do
      default_group = GroupQueries.default_group(user)
      {:ok, system_message} = Group.log_system_leave_messages(group, user.id)
      GroupChannel.broadcast_system_message(group, system_message)
      user_ids = GroupUser.user_ids(group.id)
      EventsChannel.broadcast_members_update(group, [user.id | user_ids], user_ids)

      payload = %{
        message: "User has been removed from the room",
        redirect_to: StitchConnect.Web.SubdomainRouter.Helpers.group_path(conn, :index, default_group.slug)
      }
      json(conn, payload)
    else
      {:group, nil} -> {:error, :not_found}
      {:error, :not_member} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "User isn't a member of the group."})
      {:error, :direct_message} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Cannot leave a direct message."})
      {:error, :default_group} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Cannot leave a default group."})
    end
  end

  def toggle_favorite(conn, %{"id" => group_id}) do
    case Group.toggle_favorite(group_id, conn.assigns.current_user.id) do
      {:ok, %{group_id: group_id, is_favorite: is_favorite}} ->
        EventsChannel.broadcast_group_favorite(conn.assigns.current_user, group_id, is_favorite)
        conn
        |> json(%{group_id: group_id, is_favorite: is_favorite})
      {:error, message} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: message})
    end
  end

  def toggle_public(conn, %{"id" => group_id, "public" => public}) do
    user = conn.assigns.current_user
    group = GroupQueries.get_by_id(group_id)

    case GroupAuthorization.can_toggle_public?(group, user) do
      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Not authorized to toggle the room's privacy setting."})
      true ->
        {:ok, group} = Group.toggle_public(group, public)
        TeamChannel.broadcast_group_public_status(conn.assigns.team, group)
        group = GroupQueries.load_user_data(group, user)
        render conn, "show.json", group: group, user_id: user.id
    end
  end

  def search(conn, %{"term" => term}) do
    user = conn.assigns.current_user
    result_groups = GroupQueries.search(term, user)
    render conn, "index.json", groups: result_groups, user_id: user.id
  end

  def invite(conn, %{"id" => group_id, "user_ids" => user_ids}) do
    group = GroupQueries.get_by_id(group_id)

    case GroupAuthorization.can_invite?(group, conn.assigns.current_user) do
      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Not authorized to invite people to this room."})
      true ->
        user_ids =
          user_ids
          |> String.split(",", trim: true)
          |> Enum.map(&String.to_integer/1)

        {:ok, %{removed: removed, added: _added, system_messages: system_messages}} = Group.update_members(group, user_ids)
        user_ids = GroupUser.user_ids(group.id)
        update_user_ids = Enum.uniq(user_ids ++ removed)

        Enum.each(system_messages, & GroupChannel.broadcast_system_message(group, &1))
        EventsChannel.broadcast_members_update(group, update_user_ids, user_ids)

        conn |> json(%{message: "Users invited to room."})
    end
  end

  def hide(conn, %{"id" => group_id}) do
    group = GroupQueries.get_by_id(group_id)

    case Group.hide(group, conn.assigns.current_user.id) do
      {:ok, _} ->
        EventsChannel.broadcast_group_hidden(conn.assigns.current_user, group, true)
        json(conn, %{message: "Room hidden"})
      {:error, message} ->
        conn
        |> put_status(:forbidden)
        |> json(%{message: message})
    end
  end

  def unhide(conn, %{"id" => group_id}) do
    group = GroupQueries.get_by_id(group_id)

    case Stitch.GroupAuthorization.can_view?(group, conn.assigns.current_user) do
      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Not authorized to access this room."})
      true ->
        case Group.unhide(group, conn.assigns.current_user.id) do
          {:ok, _} ->
            EventsChannel.broadcast_group_hidden(conn.assigns.current_user, group, false)
            json(conn, %{message: "Room unhidden"})
          {:error, message} ->
            conn
            |> put_status(:forbidden)
            |> json(%{message: message})
        end
    end
  end
end
