defmodule Stitch.Messages.SearchTest do
  use Stitch.DataCase, async: true
  alias Stitch.Messages.Search

  # medication
  # "medication changes"
  # walk -> walks, walking, walked
  # seren* -> serene, serenity, serendipity, serendipitous
  # teddy -bear

  # in:#emergency-room
  # in:@bharat,jonathan

  # to:@bharat
  # from:@bharat

  # before:3/30/2018
  # after:3/30/2018
  # on:3/30/2018
  # during: 3/30/2018

  describe "Stitch.Messages.Search.search/3" do
    test "it searches using search terms" do
      team = insert(:team)
      user = insert(:user, team: team)
      group = insert(:group, team: team)
      insert(:group_user, group: group, user: user)

      message =
        insert(:message, user: user, group: group, text_content: "this is an example message")

      assert ids(Search.search(user, "example message")) == ids([message])
    end

    # TODO: Test is broken because we're not matching on quotes properly.
    # test "it searches using exact search matches with quotes" do
    #   team = insert(:team)
    #   user = insert(:user, team: team)
    #   group = insert(:group, team: team)
    #   insert(:group_user, group: group, user: user)

    #   message =
    #     insert(:message, user: user, group: group, text_content: "this is an example message")

    #   insert(:message, user: user, group: group, text_content: "this example is an message")

    #   assert ids(Search.search(user, "\"an example\"")) == ids([message])
    # end

    test "it searches for messages in rooms" do
      team = insert(:team)
      user = insert(:user, team: team)
      group_a = insert(:group, team: team, name: "Example", slug: "example")
      group_b = insert(:group, team: team, name: "Emergency", slug: "emergency")
      insert(:group_user, group: group_a, user: user)
      insert(:group_user, group: group_b, user: user)

      message_a =
        insert(:message, user: user, group: group_a, text_content: "examples are for docs")

      message_b =
        insert(:message, user: user, group: group_b, text_content: "let me show you an example")

      assert ids(Search.search(user, "example in:#{group_a.id} in:#{group_b.id}")) ==
               ids([message_b, message_a])
    end

    test "it searches for messages to users" do
      team = insert(:team)
      user = insert(:user, team: team)
      group_a = insert(:group, team: team, name: "Example", slug: "example")
      insert(:group_user, group: group_a, user: user)

      message_a =
        insert(
          :message,
          user: user,
          mentioned_user_ids: [user.id],
          group: group_a,
          text_content: "examples are for docs"
        )

      assert ids(Search.search(user, "to:#{user.id}")) == ids([message_a])
    end

    test "it searches for messages from users" do
      team = insert(:team)
      user = insert(:user, team: team)
      group_a = insert(:group, team: team, name: "Example", slug: "example")
      insert(:group_user, group: group_a, user: user)

      message_a =
        insert(:message, user: user, group: group_a, text_content: "examples are for docs")

      assert ids(Search.search(user, "from:#{user.id}")) == ids([message_a])
    end
  end

  describe "Stitch.Messages.Search.parameterize/1" do
    test "returns list of params to perform search" do
      params =
        Search.parameterize(
          "medication change* in:#emergency-room to:@bharat after:3/2/2018 before:3/10/2018"
        )
    end
  end

  defp ids(messages) do
    Enum.map(messages, & &1.id)
  end
end
