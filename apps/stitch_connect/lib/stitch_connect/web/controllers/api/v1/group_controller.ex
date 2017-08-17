defmodule StitchConnect.Web.Api.V1.GroupController do
  use StitchConnect.Web, :controller
  alias Stitch.{ Group, GroupUser }
  alias StitchConnect.Web.EventsChannel

  plug StitchConnect.Plug.ApiAuthenticate when action in [:rename, :join, :leave, :users, :toggle_public, :toggle_favorite, :index, :search, :invite, :show]

  defp if_favorited_group(group, user) do
    case user.favorite_groups do
      nil ->
        Map.put_new(group, :favorite, false)
      _ ->
        favorite = group.id in user.favorite_groups
        Map.put_new(group, :favorite, favorite)
    end
  end

  def index(conn, %{"slug" => slug}) do
    case Stitch.GroupQueries.find_by_slug(slug, conn.assigns.current_user.id) do
      {:ok, group} ->
        group = if_favorited_group(group, conn.assigns.current_user)
        group = Map.put_new(group, :joined, Stitch.GroupQueries.user_is_member?(group.id, conn.assigns.current_user.id))
        render conn, "show.json", group: group
      {:error, reason} ->
        conn
        |> put_status(:not_found)
        |> json(%{message: reason})
    end
  end

  def index(conn, _params) do
    groups = Stitch.GroupQueries.available_groups(conn.assigns.current_user.id)
    groups = Enum.map(groups, fn group ->
      group = if_favorited_group(group, conn.assigns.current_user)
      group = Map.put_new(group, :joined, Stitch.GroupQueries.user_is_member?(group.id, conn.assigns.current_user.id))
    end)
    render conn, "index.json", groups: groups
  end

  def show(conn, %{"id" => group_id}) do
    case Stitch.GroupAuthorization.can_view?(group_id, conn.assigns.current_user.id) do
      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Not authorized to view this group."})
      true ->
        case Stitch.GroupQueries.get_by_id(group_id) do
          {:ok, group} ->
            group = group
            |> if_favorited_group(conn.assigns.current_user)
            |> Map.put_new(:joined, Stitch.GroupQueries.user_is_member?(group.id, conn.assigns.current_user.id))

            render conn, "show.json", group: group
          {:error, reason} ->
            conn
            |> put_status(:not_found)
            |> json(%{message: reason})
        end
    end
  end

  def rename(conn, %{"id" => group_id, "name" => name}) do
    case Stitch.GroupAuthorization.can_rename?(group_id, conn.assigns.current_user.id) do
      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Not authorized to rename this group"})
      true ->
        case Stitch.Group.rename(group_id, name) do
          {:ok, group} ->
            group = group
            |> if_favorited_group(conn.assigns.current_user)
            |> Map.put_new(:joined, Stitch.GroupQueries.user_is_member?(group.id, conn.assigns.current_user.id))

            render conn, "show.json", group: group
          {:error, reason} ->
            conn
            |> put_status(:unprocessable_entity)
            |> json(%{message: reason})
        end
    end
  end

  def users(conn, %{"id" => group_id}) do
    case Stitch.GroupAuthorization.can_view?(group_id, conn.assigns.current_user.id) do
      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Not authorized to view this group."})
      true ->
        {:ok, users} = Stitch.GroupQueries.get_users(group_id)
        render(conn, StitchConnect.Web.Api.V1.UserView, "index.json", users: users)
    end
  end

  def create(conn, params) do
    user = conn.assigns.current_user
    case Stitch.Group.create(params, user.team_id, user.id) do
      {:ok, group} ->
        group = group
        |> Map.put_new(:favorite, false)
        |> Map.put_new(:joined, true)

        EventsChannel.broadcast_group_creation(group)
        render conn, "show.json", group: group
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

  def create_multi_dm(conn, %{"user_ids" => user_ids}) do
    user = conn.assigns.current_user

    if user.id in user_ids do
      sorted_ids = user_ids |> Enum.sort |> Enum.join(".")
      slug = "__dm:#{sorted_ids}"
      params = %{"user_ids" => user_ids, "name" => "__multi_dm_group__",
        "slug" => slug, "public" => false, "creator_user_id" => user.id, "team_id" => team.id}

      case Stitch.Group.create(params, user.team_id, user.id) do
        {:ok, group} ->
          group = group
          |> Map.put_new(:favorite, false)
          |> Map.put_new(:joined, true)

          EventsChannel.broadcast_group_creation(group)
          render conn, "show.json", group: group

        {:error, :already_exists} ->
          {:ok, group} = GroupQueries.find_by_slug(slug, user.id)
          |> if_favorited_group(user)
          |> Map.put_new(:joined, true)
          render conn, "show.json", group: group

        {:error, reason} ->
          conn
          |> put_status(:unprocessable_entity)
          |> json(%{message: reason})
      end
    else

    end
  end

  def join(conn, %{"id" => group_id}) do
    case Stitch.Group.invite(group_id, conn.assigns.current_user.id) do
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
    case Stitch.Group.remove(group_id, conn.assigns.current_user.id) do
      {:error, message} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: message})
      {:ok, message} ->
        conn
        |> json(%{message: message})
    end
  end

  def toggle_favorite(conn, %{"id" => group_id}) do
    result = Stitch.Group.toggle_favorite(group_id, conn.assigns.current_user.id)
    conn
    |> json(%{group_id: group_id, favorited: result})
  end

  def toggle_public(conn, %{"id" => group_id, "public" => public}) do
    case Stitch.GroupAuthorization.can_toggle_public?(group_id, conn.assigns.current_user.id) do
      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Not authorized to toggle the group's privacy setting."})
      true ->
        {:ok, group} = Stitch.Group.toggle_public(group_id, public)
        group = if_favorited_group(group, conn.assigns.current_user)
        group = Map.put_new(group, :joined, Stitch.GroupQueries.user_is_member?(group.id, conn.assigns.current_user.id))
        render conn, "show.json", group: group
    end
  end

  def search(conn, %{"term" => term}) do
    result_groups = Stitch.GroupQueries.search(conn.assigns.current_user.id, term)
    result_groups = Enum.map(result_groups, fn group ->
      group = if_favorited_group(group, conn.assigns.current_user)
      group = Map.put_new(group, :joined, Stitch.GroupQueries.user_is_member?(group.id, conn.assigns.current_user.id))
    end)
    render conn, "index.json", groups: result_groups
  end

  def invite(conn, %{"id" => group_id, "user_ids" => ""}) do
    GroupUser.remove_all_users(group_id)
    conn |> json(%{message: "Users invited to group."})
  end

  def invite(conn, %{"id" => group_id, "user_ids" => user_ids}) do
    case Stitch.GroupAuthorization.can_invite?(group_id, conn.assigns.current_user.id) do
      false ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Not authorized to invite people to this group."})
      true ->
        split_user_ids = String.split(user_ids, ",")
        Enum.each(split_user_ids, fn(user_id) ->
          user_id = String.to_integer(user_id)
          Stitch.Group.invite(group_id, user_id)
        end)
        conn
        |> json(%{message: "Users invited to group."})
    end
  end
end
