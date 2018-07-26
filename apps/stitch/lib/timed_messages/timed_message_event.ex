defmodule Stitch.TimedMessage.Event do
  @moduledoc """
  Enqueues job or jobs for timed messages based on various events in app.
  """

  alias Stitch.TimedMessage.Worker
  alias Stitch.{Accounts.User, Invitation, Patient, Stitch.Engage.ConversationMessage}

  @doc """
  Enqueues jobs to message team owner.
  """
  @spec new_team_owner(User.t()) :: :ok
  def new_team_owner(user) do
    enqueue_messages([
      %{type: "admin_welcome", data: %{user_id: user.id}, time: in_days(0)},
      %{type: "admin_invite_prompt", data: %{user_id: user.id}, time: in_days(0)},
      %{type: "app_downloads", data: %{user_id: user.id}, time: in_days(1)},
      %{type: "admin_create_rooms", data: %{user_id: user.id}, time: in_days(6)},
      %{type: "manage_notifications", data: %{user_id: user.id}, time: in_days(10)},
      %{type: "complete_profile", data: %{user_id: user.id}, time: in_days(13)},
      %{type: "admin_invite_reminder", data: %{user_id: user.id}, time: in_days(2)},
      %{type: "admin_invite_reminder", data: %{user_id: user.id}, time: in_days(4)}
    ])
  end

  @doc """
  Enqueues jobs to message team member (non-owner).
  """
  @spec new_standard_member(User.t()) :: :ok
  def new_standard_member(user) do
    enqueue_messages([
      %{type: "user_welcome", data: %{user_id: user.id}, time: in_days(0)},
      %{type: "member_invite_prompt", data: %{user_id: user.id}, time: in_days(0)},
      %{type: "app_downloads", data: %{user_id: user.id}, time: in_days(1)},
      %{type: "manage_notifications", data: %{user_id: user.id}, time: in_days(10)},
      %{type: "complete_profile", data: %{user_id: user.id}, time: in_days(13)}
      # NOT sending these until template is updated
      # %{type: "member_invite_reminder", data: %{user_id: user.id}, time: in_days(2)},
      # %{type: "member_invite_reminder", data: %{user_id: user.id}, time: in_days(4)}
    ])
  end

  @doc """
  Enqueues jobs to message team guest (non-owner, non-standard member).
  """
  @spec new_guest_member(User.t()) :: :ok
  def new_guest_member(user) do
    enqueue_messages([
      %{type: "user_welcome", data: %{user_id: user.id}, time: in_days(0)},
      %{type: "app_downloads", data: %{user_id: user.id}, time: in_days(1)},
      %{type: "manage_notifications", data: %{user_id: user.id}, time: in_days(10)},
      %{type: "complete_profile", data: %{user_id: user.id}, time: in_days(13)}
    ])
  end

  @doc """
  Enqueues jobs to remind user about invite (if pending).
  """
  @spec new_invitation(Invitation.t()) :: :ok
  def new_invitation(invitation) do
    enqueue_messages([
      %{
        type: "invite_reminder",
        data: %{invitation_id: invitation.id},
        time: in_days(2)
      },
      %{
        type: "invite_reminder",
        data: %{invitation_id: invitation.id},
        time: in_days(4)
      }
    ])
  end

  @spec new_conversation_message_for_patient(Patient.t(), ConversationMessage.t()) :: :ok
  def new_conversation_message_for_patient(receiving_patient, conversation_message) do
    enqueue_messages([
      %{
        type: "new_conversation_message_for_patient",
        data: %{
          receiving_patient_id: receiving_patient.id,
          conversation_message_id: conversation_message.id
        },
        time: 0
      }
    ])
  end

  @spec new_conversation_message_for_provider(User.t(), ConversationMessage.t()) :: :ok
  def new_conversation_message_for_provider(receiving_provider, conversation_message) do
    enqueue_messages([
      %{
        type: "new_conversation_message_for_provider",
        data: %{
          receiving_provider_id: receiving_provider.id,
          conversation_message_id: conversation_message.id
        },
        time: 0
      }
    ])
  end

  defp enqueue_messages(message_list) do
    Enum.each(message_list, &enqueue_delivery/1)
  end

  defp enqueue_delivery(%{type: type, data: data, time: time}) do
    Exq.enqueue_in(Exq, "timed_messages", time, Worker, [type, data])
  end

  defp in_days(day_count) do
    day_count * 24 * 60 * 60
  end
end
