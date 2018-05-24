defmodule StitchConnect.Web.Email.NewMessagesView do
  use Bamboo.Phoenix, view: StitchConnect.Web.EmailView

  @from_address {"Stitch", "no-reply@teamstitch.com"}

  def new_messages_email(user, messages, team) do
    recipient = recipient(user, messages, team)

    user_time = format_datetime_subject(recipient.timezone)
    inflected_message = if recipient.new_message_count == 1, do: "message", else: "messages"

    new_email()
    |> to(System.get_env("MAILGUN_EMAIL_OVERRIDE") || recipient.email)
    |> from(@from_address)
    |> subject("[Stitch Connect] Notifications from #{team.name} #{user_time}")
    |> put_layout({StitchConnect.Web.LayoutView, :email})
    |> render(
      :new_messages,
      receiver_email: recipient.email,
      first_name: recipient.first_name,
      login_url: recipient.login_url,
      inflected_message: inflected_message,
      new_message_count: recipient.new_message_count,
      # TODO: Implement HIPAA switch; Enabled by default
      groups: prepare_messages(team, recipient, true),
      notification_settings_url: notification_settings(team)
    )
    |> Stitch.MailgunMailer.deliver_now()
  end

  defp recipient(user, messages, team) do
    %{
      first_name: user.first_name || "There",
      email: user.email,
      timezone: user.timezone["tz"],
      id: user.id,
      new_message_count: Enum.count(messages),
      messages: prepare_messages(messages, user),
      login_url: login_url(team)
    }
  end

  def prepare_messages(messages, recipient) do
    Enum.group_by(messages, & &1.group_id)
    |> Enum.map(fn
      {_group_id, []} ->
        nil

      {_group_id, messages} ->
        message = List.first(messages)
        group_name = group_name(message.group, message.user, recipient)
        %{group_name: group_name, messages: messages}
    end)
    |> Enum.filter(&(&1 != nil))
  end

  def prepare_messages(team, recipient, hipaa_enabled) do
    Enum.map(recipient.messages, fn m ->
      %{
        group_name: m.group_name,
        messages: Enum.map(m.messages, &format_message(&1, recipient, team, hipaa_enabled))
      }
    end)
  end

  def format_message(message, recipient, team, hipaa_enabled) do
    Map.merge(message, %{
      inserted_at: format_message_time(message.inserted_at, recipient.timezone),
      text_content: text_content(message, recipient.id, hipaa_enabled),
      group_url: group_url(team, message.group)
    })
  end

  def text_content(message, recipient_id, true) do
    if recipient_id in message.mentioned_user_ids do
      "mentioned you in a room message."
    else
      "sent a new room message."
    end
  end

  def text_content(message, _recipient_id, false) do
    message.text_content
  end

  def format_message_time(datetime, recipient_timezone) do
    recipient_timezone = ensure_timezone(recipient_timezone)
    datetime = Timex.Timezone.convert(datetime, recipient_timezone)
    # 3:28 PM, May 4
    Timex.format!(datetime, "{0h12}:{m} {AM}, {Mfull} {D}")
  end

  defp ensure_timezone(timezone) do
    if timezone && Timex.Timezone.exists?(timezone), do: timezone, else: "Etc/UTC"
  end

  defp format_datetime_subject(timezone) do
    if timezone && Timex.Timezone.exists?(timezone) do
      datetime = Timex.Timezone.convert(DateTime.utc_now(), timezone)
      # September 13, 2017 at 08:03 PM"
      time = Timex.format!(datetime, "{Mfull} {D}, {YYYY} at {0h12}:{m} {AM}")
      "for #{time}"
    else
      ""
    end
  end

  def group_name(%{name: "__dm_group__"}, sender, _recipient) do
    "#{sender.first_name} #{sender.last_name}"
  end

  def group_name(%{name: "__multi_dm_group__"} = group, _sender, recipient) do
    # TODO: this may become inefficient in the future, consider caching multi-dm names
    group = Stitch.Repo.preload(group, :users)
    StitchConnect.Web.Api.V1.GroupView.group_name(group, recipient.id)
  end

  def group_name(group, _sender, _recipient) do
    group.name
  end

  def subdomain_url(subdomain) do
    struct_url = StitchConnect.Web.Endpoint.struct_url()
    %{struct_url | host: "#{subdomain}.#{struct_url.host}"}
  end

  def notification_settings(team) do
    struct_url = subdomain_url(team.slug)
    StitchConnect.Web.SubdomainRouter.Helpers.admin_notification_settings_url(struct_url, :index)
  end

  def group_url(team, group) do
    struct_url = subdomain_url(team.slug)

    if Stitch.Group.direct_message?(group) do
      # Note: Because of "," and "." in DM urls, redirect would result in error.
      # TODO: Use links to DMs when hashed URLs are implemented.
      StitchConnect.Web.SubdomainRouter.Helpers.page_url(struct_url, :index)
    else
      StitchConnect.Web.SubdomainRouter.Helpers.group_url(struct_url, :index, group.slug)
    end
  end

  def login_url(team) do
    struct_url = subdomain_url(team.slug)
    StitchConnect.Web.SubdomainRouter.Helpers.group_url(struct_url, :index, "general")
  end
end
