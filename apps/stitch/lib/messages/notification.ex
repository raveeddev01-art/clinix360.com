defmodule Stitch.Message.Notification do
  alias Stitch.Repo
  alias Stitch.GroupUser
  alias Stitch.Group
  alias Stitch.Accounts.User
  import Ecto.Query

  @doc """
  Takes id of a group and a list of mentioned user ids and returns which users should be
  notified by this message based on their global and channel specific notification settings.

      %{desktop: [], mobile: []}
  """
  def notify_user_ids(%{slug: "__dm:" <> _} = group, author, _mentioned_user_ids) do
    %{desktop: desktop, mobile: mobile} = dm_notify_categories(group.id)
    %{desktop: desktop |> List.delete(author.id),
      mobile: mobile |> List.delete(author.id)}
  end

  def notify_user_ids(group, author, mentioned_user_ids) do
    %{desktop_everything: with_desktop_enabled,
      desktop_nothing: with_desktop_disabled,
      mobile_everything: with_mobile_enabled,
      mobile_nothing: with_mobile_disabled} = notify_categories(group.id)
    %{desktop: Enum.uniq(mentioned_user_ids ++ with_desktop_enabled) -- [author.id | with_desktop_disabled],
      mobile: Enum.uniq(mentioned_user_ids ++ with_mobile_enabled) -- [author.id | with_mobile_disabled]}
  end

  @doc """
  Takes id of a group and returns a map that splits group users into different notificatin categories
  based on their group-specific and global settings.
  If group-specific setting isn't "default", it takes precedence over the global setting.

      %{
        desktop_everything: [], // users that want to receive desktop notifications on every message in this group
        desktop_nothing: [],    // users that disabled desktop notification for this group
        mobile_everything: [],  // users that want to receive mobile notifications on every message in this group
        mobile_nothing: [],     // users that disabled mobile notification for this group
      }
  """
  def notify_categories(group_id) do
    GroupUser
    |> join(:inner, [gu], u in User, gu.user_id == u.id)
    |> where([gu, u], gu.group_id == ^group_id)
    |> select([gu, u], %{
      desktop_everything: fragment("coalesce (array_agg(?) filter (where (case ? when 'default' then ? = 'everything' else ? = 'everything' end)), array[]::int[])",
        u.id, gu.desktop_notification_preference, u.desktop_notification_preference, gu.desktop_notification_preference),
      desktop_nothing: fragment("coalesce (array_agg(?) filter (where (case ? when 'default' then ? = 'nothing' else ? = 'nothing' end)), array[]::int[])",
        u.id, gu.desktop_notification_preference, u.desktop_notification_preference, gu.desktop_notification_preference),
      mobile_everything: fragment("coalesce (array_agg(?) filter (where (case ? when 'default' then ? = 'everything' else ? = 'everything' end)), array[]::int[])",
        u.id, gu.mobile_notification_preference, u.mobile_notification_preference, gu.mobile_notification_preference),
      mobile_nothing: fragment("coalesce (array_agg(?) filter (where (case ? when 'default' then ? = 'nothing' else ? = 'nothing' end) ), array[]::int[])",
        u.id, gu.mobile_notification_preference, u.mobile_notification_preference, gu.mobile_notification_preference)
    })
    |> Repo.one
  end

  @doc """
  For dm and multi-dm, we want to notify all users whose global notification settings aren't set to "nothing".
  """
  def dm_notify_categories(group_id) do
    GroupUser
    |> join(:inner, [gu], u in User, gu.user_id == u.id)
    |> where([gu, u], gu.group_id == ^group_id)
    |> select([gu, u], %{
      desktop: fragment("coalesce (array_agg(?) filter (where (? != 'nothing')), array[]::int[])",
        u.id, u.desktop_notification_preference),
      mobile: fragment("coalesce (array_agg(?) filter (where (? != 'nothing')), array[]::int[])",
        u.id, u.mobile_notification_preference),
    })
    |> Repo.one
  end

  def for_user(user_id) do
    GroupUser
    |> join(:inner, [gu], g in Group, gu.group_id == g.id)
    |> join(:inner, [gu, g], u in User, gu.user_id == u.id and u.id == ^user_id)
    |> where([gu, g, u], gu.user_id == ^user_id)
    |> where([gu, g, u], g.name != "__dm_group__")
    |> select([gu, g, u], %{
      group_id: g.id,
      group_name: g.name,
      group_slug: g.slug,
      preference: fragment("case ? when 'default' then ? else ? end",
        gu.desktop_notification_preference, u.desktop_notification_preference, gu.desktop_notification_preference),
    })
    |> Repo.all
  end
end
