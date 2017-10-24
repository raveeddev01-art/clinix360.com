defmodule Stitch.MessageQueries do
  @moduledoc """
  Module in charge of all message related queries.
  """

  alias Stitch.{Repo, Accounts.User, Group, GroupUser, Message, MessageAction, Paginator}
  import Ecto.Query

  @doc """
  Returns messages for the user that matches the search term
  provided.
  """
  def search(user_id, term, opts \\ []) do
    user = Repo.get!(User, user_id)

    user_groups_ids =
      GroupUser
      |> where([gu], gu.user_id == ^user_id)
      |> select([gu], gu.group_id)
      |> Repo.all

    limit = Keyword.get(opts, :limit, 30)
    query =
      from m in Message,
      where: m.group_id in ^user_groups_ids,
      where: fragment("? % ?", m.text_content, ^term),
      where: m.type != ^"system",
      order_by: fragment("similarity(?, ?) DESC", m.text_content, ^term),
      order_by: [desc: :inserted_at],
      limit: ^limit,
      select: m,
      preload: [:user, :group, :pinned_by]

    query =
      case Keyword.fetch(opts, :skip) do
        {:ok, skip} ->
          query |> offset([m], ^skip)
        :error ->
          query
      end

    messages = Repo.all(query)
    MessageAction.apply_user_message_actions(user, messages)
  end

  @doc """
  Return the latest 30 messages for a group.
  """
  def group_latest_messages(group_id, user, opts \\ []) do
    limit = Keyword.get(opts, :limit, 30)
    offset = Keyword.get(opts, :skip, 0)

    query =
      from m in Message,
      where: m.group_id == ^group_id,
      order_by: [desc: :inserted_at],
      limit: ^limit,
      offset: ^offset,
      select: m,
      preload: [:user, :group, :pinned_by]

    query = case Keyword.fetch(opts, :max_id) do
      {:ok, max_id} -> query |> where([m], m.id < ^max_id)
      :error -> query
    end

    messages = Repo.all(query)
    MessageAction.apply_user_message_actions(user, messages)
  end

  def group_recent_messages(group_id, user, opts \\ []) do
    limit = Keyword.get(opts, :limit, 30)
    offset = Keyword.get(opts, :skip, 0)

    query =
      from m in Message,
      where: m.group_id == ^group_id,
      order_by: [asc: :inserted_at],
      limit: ^limit,
      offset: ^offset,
      select: m,
      preload: [:user, :group, :pinned_by]

    query = case Keyword.fetch(opts, :min_id) do
      {:ok, min_id} -> query |> where([m], m.id > ^min_id)
      :error -> query
    end

    messages = query |> Repo.all
    MessageAction.apply_user_message_actions(user, messages)
  end

  def user_starred_messages(user_id, opts \\ []) do
    limit = Keyword.get(opts, :limit, 30)
    offset = Keyword.get(opts, :skip, 0)

    query = from m in Message,
      join: a in MessageAction, on: a.message_id == m.id,
      where: a.category == "star",
      where: a.user_id == ^user_id,
      order_by: [desc: :inserted_at],
      limit: ^limit,
      offset: ^offset,
      preload: :user

    Repo.all(query)
  end

  def pinned_messages(%Group{id: group_id}, opts \\ []) do
    limit = opts[:limit] || 30
    offset = opts[:skip] || 0

    Message
    |> where(pinned: ^true)
    |> where(group_id: ^group_id)
    |> order_by([m], desc: m.id)
    |> preload([m], [:user])
    |> Paginator.new(limit: limit, skip: offset).data
  end

  def get_by_id(id) do
    Repo.get(Message, id) |> Repo.preload([:user, :group])
  end

  def load_info(message) do
    Repo.preload(message, [:pinned_by, :user])
  end

  def get_uploads_for_user(%User{team_id: team_id, id: user_id}, skip, limit) do
    Message
    |> join(:inner, [m], g in Group, m.group_id == g.id)
    |> join(:left, [m, g], gu in GroupUser, gu.group_id == g.id and gu.user_id == ^user_id)
    |> where([m, g, gu], m.type == fragment("'upload'"))
    |> where([m, g, gu], g.public or not is_nil(gu.id))
    |> where([m, g, gu], g.team_id == ^team_id)
    |> preload([:user, :group, :pinned_by])
    |> order_by([desc: :inserted_at])
    |> select([m], m)
    |> Paginator.new(skip: skip, limit: limit)
  end
  def get_uploads_for_user(user_id, skip, limit), do: get_uploads_for_user(Repo.get!(User, user_id), skip, limit)

  @doc """
  Retrieves all messages a given user was recently mentioned in.

  ## Options
    * `:limit` - Maximum number of messages to return. Default limit is 30.
    * `:skip` - Number of messages to offset. Default skip amount is 0.

  ## Example

      iex> user_mentioned_in(%User{...}, limit: 10)
      %Paginator{...}
  """
  @spec user_mentioned_in(User.t, [{:limit | :skip, integer}]) :: Paginator.t
  def user_mentioned_in(%User{id: user_id}, opts \\ []) do
    limit = opts[:limit] || 30
    offset = opts[:skip] || 0

    query =
      from m in Message,
      where: ^user_id in m.mentioned_user_ids,
      order_by: [desc: m.inserted_at],
      preload: [:user]

    Paginator.new(query, limit: limit, skip: offset)
  end
end
