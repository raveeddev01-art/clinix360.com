defmodule Stitch.Message.Notification do
  alias Stitch.Repo
  alias Stitch.GroupUser
  alias Stitch.Group
  alias Stitch.Accounts.User
  import Ecto.Query

  def notify_user_ids(group, author, mentioned_user_ids, active_user_ids \\ [])

  @doc """
  Takes id of a group and a list of mentioned user ids and returns which users should be
  notified by this message based on their global and channel specific notification settings.

      %{desktop: [], mobile: []}
  """

  def notify_user_ids(%{slug: "__dm:" <> _} = group, author, _mentioned_user_ids, active_user_ids) do
    %{desktop: desktop, mobile: mobile, email: email} = dm_notify_categories(group.id)

    without_active = & &1 -- active_user_ids
    without_author = & &1 -- [author.id]
    without_author_or_active = & &1 |> without_active.() |> without_author.()

    desktop_user_ids_to_notify = desktop
      |> without_author_or_active.()

    email_user_ids_to_notify = email
      |> without_author_or_active.()

    mobile_user_ids_to_notify = mobile
      |> without_author_or_active.()

    mobile_active_user_ids_to_notify = mobile
      |> intersect(active_user_ids)
      |> without_author.()

    %{
      desktop: desktop_user_ids_to_notify,
      email: email_user_ids_to_notify,
      mobile: mobile_user_ids_to_notify,
      mobile_active: mobile_active_user_ids_to_notify,
    }
  end

  def notify_user_ids(group, author, mentioned_user_ids, active_user_ids) do
    %{desktop_everything: desktop_enabled,
      desktop_nothing: desktop_disabled,
      mobile_everything: mobile_enabled,
      mobile_nothing: mobile_disabled,
      email_never: email_disabled} = notify_categories(group.id)

    # helper lambdas
    with_mentioned = & Enum.uniq(&1 ++ mentioned_user_ids)
    without_active = & &1 -- active_user_ids
    without_author = & &1 -- [author.id]
    without_author_or_active = & &1 |> without_active.() |> without_author.()
    without_desktop_disabled = & &1 -- desktop_disabled
    without_mobile_disabled = & &1 -- mobile_disabled
    without_email_disabled = & &1 -- email_disabled

    desktop_user_ids_to_notify = desktop_enabled
      |> with_mentioned.()
      |> without_author_or_active.()
      |> without_desktop_disabled.()

    mobile_user_ids_to_notify = mobile_enabled
      |> with_mentioned.()
      |> without_author_or_active.()
      |> without_mobile_disabled.()

    email_user_ids_to_notify = mentioned_user_ids
      |> without_author_or_active.()
      |> without_email_disabled.()

    mobile_active_user_ids_to_notify = mobile_enabled
      |> with_mentioned.()
      |> intersect(active_user_ids)
      |> without_author.()
      |> without_mobile_disabled.()

    %{desktop: desktop_user_ids_to_notify,
      mobile: mobile_user_ids_to_notify,
      mobile_active: mobile_active_user_ids_to_notify,
      email: email_user_ids_to_notify}
  end

  defp intersect(a, b), do: a -- (a -- b)

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
  defp notify_categories(group_id) do
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
        u.id, gu.mobile_notification_preference, u.mobile_notification_preference, gu.mobile_notification_preference),
      email_never: fragment("coalesce (array_agg(?) filter (where (? = 'never')), array[]::int[])", u.id, u.email_notification_preference)
    })
    |> Repo.one
  end

  @doc """
  For dm and multi-dm, we want to notify all users whose global notification settings aren't set to "nothing".
  """
  defp dm_notify_categories(group_id) do
    GroupUser
    |> join(:inner, [gu], u in User, gu.user_id == u.id)
    |> where([gu, u], gu.group_id == ^group_id)
    |> select([gu, u], %{
      desktop: fragment("coalesce (array_agg(?) filter (where (? != 'nothing')), array[]::int[])",
        u.id, u.desktop_notification_preference),
      mobile: fragment("coalesce (array_agg(?) filter (where (? != 'nothing')), array[]::int[])",
        u.id, u.mobile_notification_preference),
      email: fragment("coalesce (array_agg(?) filter (where (? != 'never')), array[]::int[])", u.id, u.email_notification_preference)
    })
    |> Repo.one
  end

  def for_user(user_id) do
    GroupUser
    |> join(:inner, [gu], g in Group, gu.group_id == g.id)
    |> join(:inner, [gu, g], u in User, gu.user_id == u.id and u.id == ^user_id)
    |> where([gu, g, u], gu.user_id == ^user_id)
    |> where([gu, g, u], g.name != "__dm_group__" and g.name != "__multi_dm_group__")
    |> select([gu, g, u], %{
      group_id: g.id,
      group_name: g.name,
      group_slug: g.slug,
      desktop_notification_preference: fragment("case ? when 'default' then ? else ? end",
        gu.desktop_notification_preference, u.desktop_notification_preference, gu.desktop_notification_preference),
      mobile_notification_preference: fragment("case ? when 'default' then ? else ? end",
        gu.mobile_notification_preference, u.mobile_notification_preference, gu.mobile_notification_preference),
    })
    |> Repo.all
  end
end
