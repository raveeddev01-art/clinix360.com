defmodule Stitch.TimedMessage.Worker do
  @moduledoc """
  Handles job execution for timed messages.
  """
  use Bamboo.Phoenix, view: StitchConnect.Web.EmailView
  import Bamboo.Email
  alias Stitch.TimedMessage.Helper

  @from_address {"Stitch", "hello@mail.teamstitch.com"}

  # === PUBLIC ===

  @doc """
  Called via Exq. Sends message to user based on type.
  Optionally checks user info to see if message should be sent.
  """
  @spec perform(binary, map) :: Bamboo.Email.t() | nil
  def perform(type, initial_data) do
    with {:ok, rules} <- get_rules(type),
         {:ok, data} <- load_additional_data(rules, initial_data),
         :ok <- check_sendable(rules, data) do
      new_email()
      |> from(@from_address)
      |> to([System.get_env("MAILGUN_EMAIL_OVERRIDE") || data["user"].email])
      |> set_subject(rules, data)
      |> assign_vars(rules, data)
      |> put_layout({StitchConnect.Web.LayoutView, :mail_chimp_email})
      |> render("#{type}.html")
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
    "admin_welcome" => %{
      subject: &Helper.welcome_subject/1,
      load_data: &Helper.get_user_with_team/1,
      send_if: &Helper.is_active_and_has_team/1,
      template_vars: &Helper.with_user_and_team_attrs/2
    },
    "admin_invite_prompt" => %{
      subject: "Invite your team to Stitch",
      load_data: &Helper.get_user_with_team_invites/1,
      send_if: &Helper.has_not_invited_users/1,
      template_vars: &Helper.with_admin_invitation_attrs/2
    },
    "admin_create_rooms" => %{
      subject: "Organize your conversations",
      load_data: &Helper.get_user_with_team/1,
      send_if: &Helper.is_active_user/1,
      template_vars: &Helper.with_user_and_team_attrs/2
    },
    "admin_invite_reminder" => %{
      subject: "Reminder: Invite your team to Stitch",
      load_data: &Helper.get_user_with_team_invites/1,
      send_if: &Helper.has_not_invited_users/1,
      template_vars: &Helper.with_admin_invitation_attrs/2
    },
    "app_downloads" => %{
      subject: "Get the Stitch mobile and desktop apps",
      load_data: &Helper.get_user_with_team/1,
      send_if: &Helper.is_active_user/1,
      template_vars: &Helper.with_user_and_team_attrs/2
    },
    "complete_profile" => %{
      subject: "Complete your profile",
      load_data: &Helper.get_user_with_team/1,
      send_if: &Helper.has_not_set_profile/1,
      template_vars: &Helper.with_complete_profile_link/2
    },
    "invite_reminder" => %{
      subject: "Reminder: Join your team on Stitch",
      load_data: &Helper.get_invitation_and_user/1,
      send_if: &Helper.is_invitation_pending/1,
      template_vars: &Helper.with_invitation_attrs/2
    },
    "manage_notifications" => %{
      subject: "Get notified of important messages",
      load_data: &Helper.get_user_with_team/1,
      send_if: &Helper.is_active_user/1,
      template_vars: &Helper.with_notifications_link/2
    },
    # "member_invite_reminder" => %{
    #   subject: "Reminder: Invite your teammates to Stitch",
    #   load_data: &Helper.get_user_with_team_invites/1,
    #   send_if: &Helper.user_has_invite_permissions/1,
    #   template_vars: &Helper.with_member_invitation_attrs/2
    # },
    "member_invite_prompt" => %{
      subject: "Invite your teammates to Stitch",
      load_data: &Helper.get_user_with_team_invites/1,
      send_if: &Helper.user_has_invite_permissions/1,
      template_vars: &Helper.with_member_invitation_attrs/2
    },
    "user_welcome" => %{
      subject: &Helper.welcome_subject/1,
      load_data: &Helper.get_user_with_team/1,
      send_if: &Helper.is_active_and_has_team/1,
      template_vars: &Helper.with_user_and_team_attrs/2
    }
  }

  defp get_rules(type) do
    rules = @message_rules_for_type[type]
    if rules, do: {:ok, rules}, else: {:no_matching_rule}
  end

  # ===== Handle rules =====

  defp load_additional_data(%{load_data: load_data}, initial_data) do
    load_data.(initial_data)
  end

  defp load_additional_data(_rules, data), do: {:ok, data}

  defp set_subject(email, %{subject: subject_fn}, data) when is_function(subject_fn) do
    set_subject(email, %{subject: subject_fn.(data)}, data)
  end

  defp set_subject(email, %{subject: subject_line}, _data) when is_binary(subject_line) do
    email
    |> subject(subject_line)
    |> assign(:subject, subject_line)
  end

  defp check_sendable(%{send_if: send_if}, data) do
    send_if.(data)
  end

  defp check_sendable(_rules, _data), do: :ok

  defp assign_vars(email, %{template_vars: template_vars}, data) do
    template_vars.(email, data)
  end

  defp assign_vars(email, _rules, _data), do: email
end
