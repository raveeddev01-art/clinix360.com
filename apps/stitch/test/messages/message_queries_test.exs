defmodule Stitch.MessageQueriesTest do
  use Stitch.DataCase, async: true

  describe "Stitch.MessageQueries.search/2" do
    test "returns messages containing that word" do
      team = insert(:team)
      user = insert(:user, team: team)
      group = insert(:group, team: team)

      message_bar = insert(:message, user: user, group: group, text_content: "bar")
      message_baz = insert(:message, user: user, group: group, text_content: "baz")
      message_qux = insert(:message, user: user, group: group, text_content: "qux")

      result = Stitch.MessageQueries.search(user.id, "ba")
      assert length(result) == 2
      assert Enum.find(result, &( &1.id == message_baz.id ))
      assert Enum.find(result, &( &1.id == message_bar.id ))
      refute Enum.find(result, &( &1.id == message_qux.id ))
    end

    test "returns only messages user can see" do
      team = insert(:team)
      author = insert(:user, team: team)

      public_group = insert(:group, team: team, name: "A", slug: "a", public: true)
      public_message = insert(:message, user: author, group: public_group, text_content: "Hello, world!")

      private_group = insert(:group, team: team, name: "B", slug: "b", public: false)
      private_message = insert(:message, user: author, group: private_group, text_content: "Hello, world!")

      private_member_group = insert(:group, team: team, name: "C", slug: "c", public: false)
      insert(:group_user, user: author, group: private_member_group)
      private_member_message = insert(:message, user: author, group: private_member_group, text_content: "Hello, world!")

      user = insert(:user, team: team)
      insert(:group_user, user: user, group: private_member_group)

      result = Stitch.MessageQueries.search(user.id, "hello")
      assert length(result) == 2
      assert Enum.find(result, &( &1.id == public_message.id ))
      assert Enum.find(result, &( &1.id == private_member_message.id ))
      refute Enum.find(result, &( &1.id == private_message.id ))
    end
  end

  test "Stitch.MessageQueries.user_starred_messages/1" do
    user = insert(:user)
    message = insert(:message)
    {:ok, true, _message_action} = Stitch.MessageAction.toggle_star(message, user)
    _unstarred_message = insert(:message)

    starred_message_ids =
      Stitch.MessageQueries.user_starred_messages(user.id)
      |> Enum.map(& &1.id)

    assert starred_message_ids == [message.id]
  end

  test "returns only uploads user can see with get_uploads_for_user/3" do
    skip = 0
    limit = 5
    team = insert(:team)
    author = insert(:user, team: team)

    public_group = insert(:group, team: team, name: "X", slug: "x", public: true)
    public_message = insert(:message, user: author, group: public_group, text_content: "Hello, world!")
    public_message2 = insert(:message, user: author, group: public_group, text_content: "Hello, world! upload", type: "upload")

    private_group = insert(:group, team: team, name: "Y", slug: "y", public: false)
    private_message = insert(:message, user: author, group: private_group, text_content: "Hello, world!")
    private_message2 = insert(:message, user: author, group: private_group, text_content: "Hello, world! upload", type: "upload")

    private_member_group = insert(:group, team: team, name: "Z", slug: "z", public: false)
    insert(:group_user, user: author, group: private_member_group)
    private_member_message = insert(:message, user: author, group: private_member_group, text_content: "Hello, world!")
    private_member_message2 = insert(:message, user: author, group: private_member_group, text_content: "Hello, world! upload", type: "upload")

    user = insert(:user, team: team)
    insert(:group_user, user: user, group: private_member_group)

    %Stitch.Paginator{data: data, meta: meta} = Stitch.MessageQueries.get_uploads_for_user(user, skip, limit)

    assert meta.skip == skip
    assert meta.limit == limit
    assert meta.count == 2

    assert Enum.find(data, &( &1.id == public_message2.id ))
    assert Enum.find(data, &( &1.id == private_member_message2.id ))
    refute Enum.find(data, &( &1.id == private_message2.id ))
  end
end
