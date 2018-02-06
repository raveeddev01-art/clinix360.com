defmodule Stitch.MessageQueries do
  @moduledoc """
  Module in charge of all message related queries.
  """

  alias Stitch.{Repo, Accounts.User, Group, GroupUser, Message, MessageAction, MessageQueries, Paginator, Team}
  import Ecto.Query

  @guest_roles Stitch.Accounts.Role.guests()

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
      left_join: g in assoc(m, :group),
      left_join: u in assoc(m, :user),
      left_join: pb in assoc(m, :pinned_by),
      where: m.group_id in ^user_groups_ids,
      where: m.type != ^"system",
      where: fragment("? %> ?", m.text_content, ^term),
      order_by: fragment("? <->> ?", m.text_content, ^term),
      order_by: [desc: :inserted_at],
      limit: ^limit,
      preload: [
        user: u,
        group: g,
        pinned_by: pb
      ]

    query =
      case Keyword.fetch(opts, :skip) do
        {:ok, skip} ->
          query |> offset([m], ^skip)
        :error ->
          query
      end

    messages = Repo.all(query)
    messages = MessageAction.apply_user_message_actions(user, messages)
    Message.Reaction.apply_reactions(messages)
  end

  @doc """
  Return the latest 30 messages for a group.
  """
  def group_latest_messages(group_id, user, opts \\ []) do
    limit = Keyword.get(opts, :limit, 30)
    offset = Keyword.get(opts, :skip, 0)

    query =
      from m in Message,
      left_join: g in assoc(m, :group),
      left_join: u in assoc(m, :user),
      left_join: pb in assoc(m, :pinned_by),
      where: m.group_id == ^group_id,
      order_by: [desc: :inserted_at],
      limit: ^limit,
      offset: ^offset,
      select: m,
      preload: [
        user: u,
        group: g,
        pinned_by: pb
      ]

    query = case Keyword.fetch(opts, :max_id) do
      {:ok, max_id} -> query |> where([m], m.id < ^max_id)
      :error -> query
    end

    messages = Repo.all(query)
    messages = MessageAction.apply_user_message_actions(user, messages)
    Message.Reaction.apply_reactions(messages)
  end

  def group_recent_messages(group_id, user, opts \\ []) do
    limit = Keyword.get(opts, :limit, 30)
    offset = Keyword.get(opts, :skip, 0)

    query =
      from m in Message,
      left_join: g in assoc(m, :group),
      left_join: u in assoc(m, :user),
      left_join: pb in assoc(m, :pinned_by),
      where: m.group_id == ^group_id,
      order_by: [asc: :inserted_at],
      limit: ^limit,
      offset: ^offset,
      select: m,
      preload: [
        user: u,
        group: g,
        pinned_by: pb
      ]

    query = case Keyword.fetch(opts, :min_id) do
      {:ok, min_id} -> query |> where([m], m.id > ^min_id)
      :error -> query
    end

    messages = query |> Repo.all
    messages = MessageAction.apply_user_message_actions(user, messages)
    Message.Reaction.apply_reactions(messages)
  end

  def user_starred_messages(user_id, opts \\ []) do
    limit = Keyword.get(opts, :limit, 30)
    offset = Keyword.get(opts, :skip, 0)

    query =
      from m in Message,
      join: a in MessageAction, on: a.message_id == m.id,
      left_join: u in assoc(m, :user),
      where: a.category == "star",
      where: a.user_id == ^user_id,
      order_by: [desc: :inserted_at],
      limit: ^limit,
      offset: ^offset,
      preload: [user: u]

    Repo.all(query)
  end

  def pinned_messages(%Group{id: group_id}, opts \\ []) do
    limit = opts[:limit] || 30
    offset = opts[:skip] || 0

    query =
      from m in Message,
      left_join: u in assoc(m, :user),
      left_join: pb in assoc(m, :pinned_by),
      where: m.pinned == true,
      where: m.group_id == ^group_id,
      order_by: [desc: m.inserted_at],
      preload: [
        user: u,
        pinned_by: pb
      ]
    Paginator.new(query, skip: offset, limit: limit)
  end

  def get_by_id(id) do
    query =
      from m in Message,
      left_join: u in assoc(m, :user),
      left_join: g in assoc(m, :group),
      where: m.id == ^id,
      preload: [
        group: g,
        user: u
      ]
    Repo.one(query)
  end

  def load_info(message) do
    Repo.preload(message, [:pinned_by, :user])
  end

  def get_uploads_for_user(%User{team_id: team_id, id: user_id, roles: [role]}, skip, limit) when not role in @guest_roles do
    query =
      from m in Message,
      join: g in assoc(m, :group),
      left_join: gu in GroupUser, on: gu.group_id == g.id and gu.user_id == ^user_id,
      left_join: u in assoc(m, :user),
      left_join: pb in assoc(m, :pinned_by),
      where: m.type == "upload",
      where: g.public or not is_nil(gu.id),
      where: g.team_id == ^team_id,
      order_by: [desc: m.inserted_at],
      preload: [
        user: u,
        group: g,
        pinned_by: pb
      ]

    Paginator.new(query, skip: skip, limit: limit)
  end
  def get_uploads_for_user(%User{team_id: team_id, id: user_id}, skip, limit) do
    query =
      from m in Message,
      join: g in assoc(m, :group),
      join: gu in GroupUser, on: gu.group_id == g.id and gu.user_id == ^user_id,
      left_join: u in assoc(m, :user),
      left_join: pb in assoc(m, :pinned_by),
      where: m.type == "upload",
      where: g.team_id == ^team_id,
      order_by: [desc: m.inserted_at],
      preload: [
        user: u,
        group: g,
        pinned_by: pb
      ]

    Paginator.new(query, skip: skip, limit: limit)
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
      left_join: u in assoc(m, :user),
      where: ^user_id in m.mentioned_user_ids,
      order_by: [desc: m.inserted_at],
      preload: [user: u]

    Paginator.new(query, limit: limit, skip: offset)
  end

  @doc """
  Returns the number of messages sent for a user or team in a given period of
  time.

  ## Supported time periods:
    * `:last_day`
    * `:last_7_days`
    * `:last_30_days`
    * `:all_time`

  ## Example

      iex> count(%User{...}, %{time_period: :last_7_days})
      28

  """
  @spec count(User.t | Team.t, map) :: non_neg_integer
  def count(target, %{time_period: :all_time} = opts) do
    start_at = NaiveDateTime.to_date(target.inserted_at)
    end_at = Map.get(opts, :end_at, yesterday())
    count(target, %{start_at: start_at, end_at: end_at})
  end
  def count(target, %{time_period: time_period} = opts) do
    time_periods = %{last_30_days: -29, last_7_days: -6, last_day: 0}
    number_of_days = Map.get(time_periods, time_period)
    end_at = Map.get(opts, :end_at, yesterday())
    start_at = Date.add(end_at, number_of_days)
    count(target, %{start_at: start_at, end_at: end_at})
  end
  def count(%User{id: user_id}, %{start_at: start_at, end_at: end_at}) do
    {:ok, start_at_datetime} = NaiveDateTime.new(start_at, ~T[00:00:00])
    {:ok, end_at_datetime} = NaiveDateTime.new(end_at, ~T[23:59:59.999999])

    query =
      from m in Message,
      where: m.user_id == ^user_id,
      where: m.inserted_at >= ^start_at_datetime,
      where: m.inserted_at <= ^end_at_datetime
    Repo.aggregate(query, :count, :id)
  end
  def count(%Team{id: team_id}, %{start_at: start_at, end_at: end_at}) do
    {:ok, start_at_datetime} = NaiveDateTime.new(start_at, ~T[00:00:00])
    {:ok, end_at_datetime} = NaiveDateTime.new(end_at, ~T[23:59:59.999999])

    query =
      from m in Message,
      join: g in assoc(m, :group),
      where: g.team_id == ^team_id,
      where: m.inserted_at >= ^start_at_datetime,
      where: m.inserted_at <= ^end_at_datetime
    Repo.aggregate(query, :count, :id)
  end

  @doc """
  Returns a NaiveDateTime struct representing the last message sent for a given
  user or team.

  ## Example

      iex> last_occurred_at(%User{...})
      %NaiveDateTime{...}

  """
  @spec last_occurred_at(User.t | Team.t) :: NaiveDateTime.t
  def last_occurred_at(%User{id: user_id}) do
    query =
      from m in Message,
      where: m.user_id == ^user_id,
      order_by: [desc: m.inserted_at],
      select: m.inserted_at,
      limit: 1
    Repo.one(query)
  end
  def last_occurred_at(%Team{id: team_id}) do
    query =
      from m in Message,
      join: g in assoc(m, :group),
      where: g.team_id == ^team_id,
      order_by: [desc: m.inserted_at],
      select: m.inserted_at,
      limit: 1
    Repo.one(query)
  end

  @spec surrounding(Message.t, Group.t, User.t, pos_integer) :: {[Message.t], [Message.t]}
  def surrounding(%Message{id: message_id}, %Group{id: group_id}, %User{} = user, limit) do
    messages_before = MessageQueries.group_latest_messages(group_id, user, max_id: message_id, limit: limit) |> Enum.reverse
    messages_after = MessageQueries.group_recent_messages(group_id, user, min_id: message_id, limit: limit)
    {messages_before, messages_after}
  end

  defp yesterday, do: Date.add(Date.utc_today(), -1)

end
