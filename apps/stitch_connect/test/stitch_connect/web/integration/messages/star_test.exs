defmodule StitchConnect.Web.Messages.StarTest do
  use StitchConnect.Web.FeatureCase

  @tag :start_session
  test "user can star messages", %{session: session} do
    team = Stitch.Team.Onboarding.create_team("Some Team Name", "someslug")
    current_user = insert(:user, team: team)
    another_user = insert(:user, team: team)
    default_group = Stitch.GroupQueries.default_group(current_user)

    messages = [
      insert(:message, group: default_group, user: current_user),
      insert(:message, group: default_group, user: another_user)
    ]

    session
    |> sign_in(team, current_user)
    |> click(button("Join"))
    |> show_starred_messages

    Enum.each messages, fn message ->
      session
      |> refute_has(in_starred_messages(message))
      |> star(message)
      |> assert_has(star_icon(message))
      |> assert_has(in_starred_messages(message))
      |> unstar(message)
      |> refute_has(star_icon(message))
      |> refute_has(in_starred_messages(message))
    end
  end

  def show_starred_messages(session) do
    session
    |> click(css(".more-btn"))
    |> click(css(".more-menu a", text: "Starred"))
  end

  defp in_starred_messages(message) do
    css(".global-starred-messages-addon .message-body", text: message.text_content)
  end

  defp star(session, message) do
    session
    |> click(css("[name='message_#{message.id}'] .message-header .time"))
    |> click(css("[name='message_#{message.id}'] .message-actions .dropdown-toggle"))
    |> click(css("[name='message_#{message.id}'] .message-actions a", text: "Star"))
  end

  defp unstar(session, message) do
    session
    |> click(css("[name='message_#{message.id}'] .message-header .time"))
    |> click(css("[name='message_#{message.id}'] .message-actions .dropdown-toggle"))
    |> click(css("[name='message_#{message.id}'] .message-actions a", text: "Unstar"))
  end

  defp star_icon(message) do
    css("[name='message_#{message.id}'] .message-header .message-icon.icon-star")
  end
end
