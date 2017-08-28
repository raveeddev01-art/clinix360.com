defmodule Stitch.MessageQueries do
  @moduledoc """
  Module in charge of all message related queries.
  """

  alias Stitch.{Repo, User, Group, GroupUser, Message, MessageAction}
  import Ecto.Query

  @doc """
  Returns messages for the user that matches the search term
  provided.
  """
  def search(user_id, term, opts \\ []) do
    user = Repo.get!(User, user_id)

    user_groups_ids =
      from(g in Group,
      where: g.team_id == ^user.team_id,
      left_join: gu in GroupUser, on: gu.group_id == g.id and gu.user_id == ^user.id,
      where: g.public or not is_nil(gu.id),
      select: g.id) |> Repo.all

    limit = Keyword.get(opts, :limit, 30)
    query =
      from m in Message,
      where: m.group_id in ^user_groups_ids,
      where: fragment("? % ?", m.text_content, ^term),
      order_by: fragment("similarity(?, ?) DESC", m.text_content, ^term),
      order_by: [desc: :inserted_at],
      limit: ^limit,
      select: m,
      preload: [:user, :group, :pinned_by]

    query =
      case Keyword.fetch(opts, :max_id) do
        {:ok, max_id} ->
          query |> where([m], m.id < ^max_id)
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

    query =
      from m in Message,
      where: m.group_id == ^group_id,
      order_by: [desc: :inserted_at],
      limit: ^limit,
      select: m,
      preload: [:user, :group, :pinned_by]

    query = case Keyword.fetch(opts, :max_id) do
      {:ok, max_id} -> query |> where([m], m.id < ^max_id)
      :error -> query
    end

    messages = Repo.all(query)
    MessageAction.apply_user_message_actions(user, messages)
  end

  def user_starred_messages(user_id) do
    query = from m in Message,
      join: a in MessageAction, on: a.message_id == m.id,
      where: a.category == "star",
      where: a.user_id == ^user_id,
      preload: :user

    Repo.all(query)
  end

  def get_by_id(id) do
    Repo.get(Message, id) |> Repo.preload([:user, :group])
  end

  def load_info(message) do
    Repo.preload(message, [:pinned_by, :user])
  end
end
