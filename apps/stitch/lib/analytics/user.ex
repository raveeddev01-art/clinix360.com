defmodule Stitch.Analytics.User do
  @moduledoc """
  Manage user analytics logic
  """

  @analytics Application.get_env(:stitch, :analytics)

  # === EVENT NAMES ===

  @event_demo_requested "Requested Demo"

  @doc """
  Logs events for demo requests
  """
  def track_demo_requested(user_properties) do
    Stitch.Task.start fn ->
      @analytics.track(
        @event_demo_requested,
        formatted_properties(user_properties)
      )
    end
  end

  # ============
  #   PRIVATE
  # ============

  defp formatted_properties(user_properties) do
    %{
      "full_name" => user_properties["fullName"],
      "email" => user_properties["email"],
      "phone_number" => user_properties["phoneNumber"],
      "company" => user_properties["companyName"]
    }
  end
end
