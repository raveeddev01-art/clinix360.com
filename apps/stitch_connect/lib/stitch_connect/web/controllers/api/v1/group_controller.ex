defmodule StitchConnect.Web.Api.V1.GroupController do
  use StitchConnect.Web, :controller
  alias Stitch.{Group, GroupQueries, GroupAuthorization, TeamAuthorization, MessageQueries}
  alias StitchConnect.Web.{Endpoint, EventsChannel}

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
        |> Map.put_new(:favorite, false)
        |> Map.put_new(:is_hidden, false)
        |> Map.put_new(:last_read_at, nil)
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
          |> Map.put_new(:favorite, false)
          |> Map.put_new(:is_hidden, false)
          |> Map.put_new(:last_read_at, nil)
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
    group = GroupQueries.get_by_id(group_id)

    case Stitch.TeamAuthorization.user_is_member?(conn.assigns.current_user.team_id, conn.assigns.current_user.id) do
      true ->
        case Group.add_user(group, conn.assigns.current_user.id) do
          {:error, _, _, _} ->
            conn
            |> put_status(:unprocessable_entity)
            |> json(%{message: "Cannot add user to the room"})
          {:ok, %{group_user: group_user, system_message: system_message}} ->
            {:ok, group} = GroupQueries.get_by_id(group_id, conn.assigns.current_user)
            system_message = MessageQueries.load_info(system_message)
            Endpoint.broadcast("groups:#{group.slug}", "new_msg", system_message)
            EventsChannel.broadcast_group_join(group, conn.assigns.current_user.id)

            conn
            |> json(%{group_id: group_user.group_id, user_id: group_user.user_id})
        end
      false ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Cannot add user to the room"})
    end
  end

  def leave(conn, %{"id" => group_id}) do
    current_user = conn.assigns.current_user
    group = GroupQueries.get_by_id(group_id)

    case Group.remove(group, current_user.id) do
      {:error, message} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: message})
      {:ok, message, system_message} ->
        default_group = GroupQueries.default_group(current_user)
        Endpoint.broadcast("groups:#{group.slug}", "new_msg", MessageQueries.load_info(system_message))
        Endpoint.broadcast("events:#{current_user.id}", "left_group", %{group_id: group.id})
        conn
        |> json(%{message: message, redirect_to: StitchConnect.Web.SubdomainRouter.Helpers.group_path(conn, :index, default_group.slug)})

    end
  end

  def toggle_favorite(conn, %{"id" => group_id}) do
    case Group.toggle_favorite(group_id, conn.assigns.current_user.id) do
      {:ok, %{group_id: group_id, is_favorite: is_favorite}} ->
        EventsChannel.broadcast_group_favorite(conn.assigns.current_user, group_id, is_favorite)
        conn
        |> json(%{group_id: group_id, favorited: is_favorite})
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
          |> String.split(",")
          |> Enum.map(&String.to_integer/1)

        Group.update_members(group, user_ids)

        conn
        |> json(%{message: "Users invited to room."})
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
