defmodule Stitch.TransactionalMessage.Worker do
  @moduledoc """
  Handles job execution for transactional messages.
  """
  use Bamboo.Phoenix, view: StitchConnect.EmailView
  import Bamboo.Email

  alias Stitch.{Repo, Accounts.User, MessageQueries, Invitation}

  @from_address {"Stitch", "hello@sandboxc0c353f0ee914b16af6977446c28f5c5.mailgun.org"}

  # === PUBLIC ===

  @doc """
  Called via Exq. Sends message to user based on type.
  Optionally checks user info to see if message should be sent.
  """
  @spec perform(binary, map) :: Bamboo.Email.t() | nil
  def perform(type, initial_data) do
    with {:ok, rules} <- get_rules(type),
         {:ok, data} <- load_additional_data(rules, initial_data),
         {:ok} <- check_sendable(rules, data) do
      new_email()
      |> from(@from_address)
      |> to([System.get_env("MAILGUN_EMAIL_OVERRIDE") || data["user"].email])
      |> subject(rules.subject())
      |> assign_vars(rules, data)
      |> assign(:subject, rules.subject())
      |> put_html_layout({StitchConnect.EmailView, "layout/email.html"})
      |> render("email/#{type}.html")
      |> Stitch.NewMailer.deliver_later()
    end
  end

  # === PRIVATE ===

  # MESSAGE RULES:
  # key:           message type defined in job data (must match template name)
  # subject:       subject line for email
  # load_data:     lambda fetches and adds data to map
  # send_if:       lambda returns truthy if email should be sent
  # template_vars: lambda assigning variables for template render

  @message_rules_for_type %{
    # SHARED MESSAGES
    "complete_profile" => %{
      subject: "Complete your Stitch profile",
      load_data: &__MODULE__.get_user/1,
      send_if: &__MODULE__.is_active_user/1
    },
    "manage_notifications" => %{
      subject: "Manage your notifications on Stitch",
      load_data: &__MODULE__.get_user/1,
      send_if: &__MODULE__.is_active_user/1
    },
    "app_downloads" => %{
      subject: "Download the Stitch App!",
      load_data: &__MODULE__.get_user_with_mobile_message_check/1,
      send_if: &__MODULE__.is_active_and_not_sent_mobile_message/1
    },
    # ADMIN SPECIFIC MESSAGES
    "admin_welcome" => %{
      subject: "Welcome to Stitch Connect",
      load_data: &__MODULE__.get_user_with_team/1,
      send_if: &__MODULE__.is_active_and_has_team/1,
      template_vars: &__MODULE__.with_user_and_team_attrs/2
    },
    "admin_invite_prompt" => %{
      subject: "Invite your team to Stitch Connect",
      load_data: &__MODULE__.get_user/1,
      send_if: &__MODULE__.is_active_user/1
    },
    "admin_create_rooms" => %{
      subject: "Room creation tips on Stitch",
      load_data: &__MODULE__.get_user/1,
      send_if: &__MODULE__.is_active_user/1
    },
    # STANDARD USER SPECIFIC MESSAGES
    "user_welcome" => %{
      subject: "Welcome to Stitch Connect",
      load_data: &__MODULE__.get_user_with_team/1,
      send_if: &__MODULE__.is_active_and_has_team/1,
      template_vars: &__MODULE__.with_user_and_team_attrs/2
    },
    # GUEST USER SPECIFIC MESSAGES
    "guest_welcome" => %{
      subject: "Welcome to Stitch Connect",
      load_data: &__MODULE__.get_user_with_team/1,
      send_if: &__MODULE__.is_active_and_has_team/1,
      template_vars: &__MODULE__.with_user_and_team_attrs/2
    },
    # INVITE MESSAGES
    "invite_reminder_a" => %{
      subject: "Your team is waiting on Stitch",
      load_data: &__MODULE__.get_invitation_and_user/1,
      send_if: &__MODULE__.is_invitation_pending/1
    },
    "invite_reminder_b" => %{
      subject: "Join your team on Stitch",
      load_data: &__MODULE__.get_invitation_and_user/1,
      send_if: &__MODULE__.is_invitation_pending/1
    }
  }

  defp get_rules(type) do
    rules = @message_rules_for_type[type]
    if rules, do: {:ok, rules}, else: {:no_matching_rule}
  end

  # === Handle optional Lambdas ===

  defp load_additional_data(%{load_data: load_data}, initial_data) do
    load_data.(initial_data)
  end

  defp load_additional_data(_rules, data), do: {:ok, data}

  defp assign_vars(email, %{template_vars: template_vars}, data) do
    template_vars.(email, data)
  end

  defp assign_vars(email, _rules, _data), do: email

  defp check_sendable(%{send_if: send_if}, data) do
    send_if.(data)
  end

  defp check_sendable(_rules, _data), do: {:ok}

  # === Loading Data ===

  def get_user(data) do
    user = Repo.get(User, data["user_id"])
    {:ok, Map.put(data, "user", user)}
  end

  def get_invitation_and_user(data) do
    invitation =
      Invitation
      |> Repo.get(data["invitation_id"])
      |> Repo.preload(:user)

    new_data =
      data
      |> Map.put("invitation", invitation)
      |> Map.put("user", invitation.user)

    {:ok, new_data}
  end

  def get_user_with_team(data) do
    user =
      User
      |> Repo.get(data["user_id"])
      |> Repo.preload(team: :subscription)

    {:ok, Map.put(data, "user", user)}
  end

  def get_user_with_mobile_message_check(data) do
    user = Repo.get(User, data["user_id"])
    mobile_message_count = MessageQueries.mobile_count_for_user(data["user_id"])

    loaded_data =
      data
      |> Map.put("user", user)
      |> Map.put("has_sent_mobile_message", mobile_message_count > 0)

    {:ok, loaded_data}
  end

  # === Checking Sendable ===

  def is_active_user(%{"user" => user}) do
    sendable = user && user.onboarded && !user.disabled
    if sendable, do: {:ok}, else: {:not_sendable}
  end

  def is_active_and_has_team(data) do
    with {:ok} <- is_active_user(data),
         {:ok} <- has_team_subscription(data) do
      {:ok}
    else
      _ -> {:not_sendable}
    end
  end

  def is_active_and_not_sent_mobile_message(data) do
    with {:ok} <- is_active_user(data),
         {:ok} <- has_not_sent_mobile_message(data) do
      {:ok}
    else
      _ -> {:not_sendable}
    end
  end

  def is_invitation_pending(%{"invitation" => invitation}) do
    sendable = invitation && !invitation.accepted
    if sendable, do: {:ok}, else: {:not_sendable}
  end

  defp has_team_subscription(%{"user" => user}) do
    sendable = user && user.team && user.team.subscription
    if sendable, do: {:ok}, else: {:not_sendable}
  end

  defp has_not_sent_mobile_message(%{"has_sent_mobile_message" => false}), do: {:ok}
  defp has_not_sent_mobile_message(_data), do: {:not_sendable}

  # === Assigning Vars ===

  def with_user_and_team_attrs(email, %{"user" => user}) do
    email
    |> assign(:user_email, user.email)
    |> assign(:team_name, user.team.name)
    |> assign(:subscription_tier, user.team.subscription.tier)
    |> assign(:team_login_url, "https://www.#{user.team.slug}.teamstitch.com/login")
  end
end
