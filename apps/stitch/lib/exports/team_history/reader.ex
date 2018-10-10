defmodule Stitch.Exports.TeamHistory.Reader do
  @moduledoc """
  This module includes functions for reading team history related data from
  database and preparing it for exports.
  """
  use Timex
  import Ecto.Query
  alias Stitch.Accounts.User
  alias Stitch.{Repo, Team, Group, Message}

  @user_data_export_fields ~w(
    id email inserted_at updated_at team_id roles username first_name last_name
    phone_number title profile_image_url is_bot disabled
  )a

  @message_data_export_fields ~w(
    id user_id group_id deleted text_content fields inserted_at updated_at type
    pinned pinned_by_id pinned_at edited_at read_status mentioned_user_ids
  )a

  @doc """
  Returns group data to export for a given team.
  """
  @spec get_group_data(Team.t(), pos_integer) :: [map]
  def get_group_data(%Team{id: id}, timeout) do
    message_fields = [:id, :user_id, :pinned_by_id, :pinned_at]

    query =
      from(
        g in Group,
        left_join: gu in assoc(g, :group_users),
        left_join: m in Message,
        on: [group_id: g.id, pinned: true],
        where: g.team_id == ^id,
        order_by: [asc: g.inserted_at],
        preload: [group_users: gu, messages: m],
        select:
          map(g, [
            :id,
            :name,
            :slug,
            :is_default,
            :description,
            :public,
            group_users: [:id, :user_id],
            messages: message_fields
          ])
      )

    query
    |> Repo.all(timeout: timeout)
    |> prepare_group_data_for_export()
  end

  defp prepare_group_data_for_export(groups) do
    update_in(groups, [Access.all()], &prepare_group_for_export/1)
  end

  defp prepare_group_for_export(group) do
    group
    |> update_in([Access.key!(:group_users), Access.all()], fn %{user_id: user_id} -> user_id end)
    |> swap_key(%{from: :group_users, to: :members})
    |> swap_key(%{from: :messages, to: :pins})
  end

  defp swap_key(map, %{from: from, to: to}) do
    {value, key_less} = Map.pop(map, from)
    Map.put(key_less, to, value)
  end

  @doc """
  Returns user data to export for a given team.
  """
  @spec get_user_data(Team.t(), pos_integer) :: [map]
  def get_user_data(%Team{id: id}, timeout) do
    query =
      from(
        u in User,
        where: u.team_id == ^id,
        order_by: [asc: u.inserted_at],
        select: map(u, @user_data_export_fields)
      )

    Repo.all(query, timeout: timeout)
  end

  @doc """
  Returns message data to export for a given team and day.
  """
  @spec get_message_data_for_day(Team.t(), {pos_integer, pos_integer, pos_integer}, pos_integer) ::
          [map]
  def get_message_data_for_day(%Team{id: id}, {year, month, day}, timeout) do
    {:ok, beginning_of_day} = NaiveDateTime.new(year, month, day, 0, 0, 0)
    end_of_day = Timex.end_of_day(beginning_of_day)

    query =
      from(
        g in Group,
        left_join: m in assoc(g, :messages),
        where: g.team_id == ^id,
        where: m.inserted_at >= ^beginning_of_day,
        where: m.inserted_at <= ^end_of_day,
        order_by: [asc: m.inserted_at],
        preload: [messages: m],
        select: map(g, [:id, :name, :slug, messages: @message_data_export_fields])
      )

    query
    |> Repo.all(timeout: timeout)
    |> prepare_message_data_for_export()
  end

  def get_message_data_for_day(%Team{id: id}, {year, month, day}, target_user, timeout) do
    {:ok, beginning_of_day} = NaiveDateTime.new(year, month, day, 0, 0, 0)
    end_of_day = Timex.end_of_day(beginning_of_day)

    query =
      from(
        g in Group,
        left_join: m in assoc(g, :messages),
        where: g.team_id == ^id,
        where: m.user_id == ^target_user.id,
        where: m.inserted_at >= ^beginning_of_day,
        where: m.inserted_at <= ^end_of_day,
        order_by: [asc: m.inserted_at],
        preload: [messages: m],
        select: map(g, [:id, :name, :slug, messages: @message_data_export_fields])
      )

    query
    |> Repo.all(timeout: timeout)
    |> prepare_message_data_for_export()
  end

  defp prepare_message_data_for_export(message_data) do
    message_data
    |> update_in([Access.all()], &swap_key(&1, %{from: :id, to: :group_id}))
    |> update_in([Access.all()], &swap_key(&1, %{from: :slug, to: :group_name}))
    |> update_in([Access.all(), Access.key!(:messages)], &group_messages_by_date/1)
  end

  defp group_messages_by_date(messages) do
    messages
    |> Stitch.Message.Reaction.apply_reactions(:message)
    |> Enum.group_by(fn message ->
      Timex.format!(message.inserted_at, "%Y-%m-%d", :strftime)
    end)
  end
end
