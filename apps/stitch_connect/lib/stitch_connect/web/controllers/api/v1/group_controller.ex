defmodule StitchConnect.Web.Api.V1.GroupController do
  use StitchConnect.Web, :controller
  alias Stitch.{Group, GroupUser, GroupQueries, GroupAuthorization}
  alias StitchConnect.Web.EventsChannel

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
    case GroupAuthorization.can_rename?(group_id, user.id) do
      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Not authorized to rename this group"})
      true ->
        case Group.rename(GroupQueries.get_by_id(group_id), name) do
          {:ok, group} ->
            group = GroupQueries.load_user_data(group, user)

            render conn, "show.json", group: group, user_id: user.id
          {:error, reason} ->
            conn
            |> put_status(:unprocessable_entity)
            |> json(%{message: reason})
        end
    end
  end

  def users(conn, %{"id" => group_id}) do
    case GroupAuthorization.can_view?(group_id, conn.assigns.current_user.id) do
      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Not authorized to view this group."})
      true ->
        {:ok, users} = GroupQueries.get_users(group_id)
        render(conn, StitchConnect.Web.Api.V1.UserView, "index.json", users: users)
    end
  end

  def create(conn, params) do
    user = conn.assigns.current_user
    case Group.create(params, user.team_id, user.id) do
      {:ok, group} ->
        group = group
        |> Map.put_new(:joined, true)
        |> Map.put_new(:unread_messages_count, 0)
        |> Map.put_new(:favorite, false)
        |> Map.put_new(:last_read_at, nil)
        |> Map.put_new(:mentions_count, 0)

        EventsChannel.broadcast_group_creation(group)
        render conn, "show.json", group: group, user_id: user.id
      {:error, :already_exists} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Group with given name already exists."})
      {:error, reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: reason})
    end
  end

  def create_single_dm(conn, %{"user_ids" => user_ids}) do
    user = conn.assigns.current_user

    case Group.create_single_dm(user, user_ids) do
      {:ok, group} ->
        group =
          group
          |> Map.put_new(:joined, true)
          |> Map.put_new(:unread_messages_count, 0)
          |> Map.put_new(:favorite, false)
          |> Map.put_new(:last_read_at, nil)
          |> Map.put_new(:mentions_count, 0)

        EventsChannel.broadcast_group_creation(group)
        render conn, "show.json", group: group, user_id: user.id

      {:error, :user_id_count_is_not_2} ->
        conn
        |> put_status(:bad_request)
        |> json(%{message: "user_ids param should contain 2 ids"})

      {:error, {:already_exists, slug}} ->
        {:ok, group} = GroupQueries.find_by_slug(slug, user.id)
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

  def create_multi_dm(conn, %{"user_ids" => user_ids}) do
    cond do
      length(user_ids) <= 2 ->
        conn
        |> put_status(:bad_request)
        |> json(%{message: "user_ids param should contain more than 2 ids"})
      true ->
        conn
        |> create_dm(user_ids, "__multi_dm_group__")
      end
  end

  defp create_dm(conn, user_ids, name) do
    user = conn.assigns.current_user

    cond do
      not user.id in user_ids ->
        conn
        |> put_status(:bad_request)
        |> json(%{message: "user_ids param has to contain current user's id"})

      true ->
        sorted_ids = user_ids |> Enum.sort |> Enum.join(".")
        slug = "__dm:#{sorted_ids}"
        params = %{"user_ids" => user_ids, "name" => name, "slug" => slug, "public" => false}

        case Group.create(params, user.team_id, user.id) do
          {:ok, group} ->
            group = group
            |> Map.put_new(:joined, true)
            |> Map.put_new(:unread_messages_count, 0)
            |> Map.put_new(:favorite, false)
            |> Map.put_new(:last_read_at, nil)
            |> Map.put_new(:mentions_count, 0)

            EventsChannel.broadcast_group_creation(group)
            render conn, "show.json", group: group, user_id: user.id

          {:error, {:already_exists, slug}} ->
            {:ok, group} = GroupQueries.find_by_slug(slug, user.id)
            render conn, "show.json", group: group, user_id: user.id

          {:error, reason} ->
            conn
            |> put_status(:unprocessable_entity)
            |> json(%{message: reason})
        end
      end
  end

  def join(conn, %{"id" => group_id}) do
    case Group.invite(group_id, conn.assigns.current_user.id) do
      {:error, _} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Cannot add user to the group"})
      {:ok, group_user} ->
        conn
        |> json(%{group_id: group_user.group_id, user_id: group_user.user_id})
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
      {:ok, message} ->
        default_group = GroupQueries.default_group(current_user)
        conn
        |> json(%{message: message, redirect_to: "/groups/#{default_group.slug}"})
    end
  end

  def toggle_favorite(conn, %{"id" => group_id}) do
    case Group.toggle_favorite(group_id, conn.assigns.current_user.id) do
      {:ok, %{group_id: group_id, is_favorite: is_favorite}} ->
        conn |> json(%{group_id: group_id, favorited: is_favorite})
      {:error, message} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: message})
    end
  end

  def toggle_public(conn, %{"id" => group_id, "public" => public}) do
    user = conn.assigns.current_user
    case GroupAuthorization.can_toggle_public?(group_id, user.id) do
      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Not authorized to toggle the group's privacy setting."})
      true ->
        {:ok, group} = Group.toggle_public(group_id, public)
        group = GroupQueries.load_user_data(group, user)
        render conn, "show.json", group: group, user_id: user.id
    end
  end

  def search(conn, %{"term" => term}) do
    user = conn.assigns.current_user
    result_groups = GroupQueries.search(term, user)
    render conn, "index.json", groups: result_groups, user_id: user.id
  end

  def invite(conn, %{"id" => group_id, "user_ids" => ""}) do
    GroupUser.remove_all_users(group_id)
    conn |> json(%{message: "Users invited to group."})
  end

  def invite(conn, %{"id" => group_id, "user_ids" => user_ids}) do
    case GroupAuthorization.can_invite?(group_id, conn.assigns.current_user.id) do
      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Not authorized to invite people to this group."})
      true ->
        split_user_ids = String.split(user_ids, ",")
        Enum.each(split_user_ids, fn(user_id) ->
          user_id = String.to_integer(user_id)
          Group.invite(group_id, user_id)
        end)
        conn
        |> json(%{message: "Users invited to group."})
    end
  end
end
