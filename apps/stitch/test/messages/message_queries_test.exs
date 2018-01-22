defmodule Stitch.MessageQueriesTest do
  use Stitch.DataCase, async: true
  alias Stitch.MessageQueries

  describe "Stitch.MessageQueries.search/2" do
    test "returns messages containing that word" do
      team = insert(:team)
      user = insert(:user, team: team)
      group = insert(:group, team: team)
      insert(:group_user, group: group, user: user)
      insert(:message, user: user, group: group, text_content: "x")

      quick_brown_fox =
        insert(:message, user: user, group: group, text_content:
               "The quick brown fox jumps over the lazy dog.")
      all_good_men =
        insert(:message, user: user, group: group, text_content:
               "Now is the time for all good men to come to the aid of the party.")
      lorem_ipsum =
        insert(:message, user: user, group: group, text_content:
               "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.")
      foobar = insert(:message, user: user, group: group, text_content: "foobar")
      foobaz = insert(:message, user: user, group: group, text_content: "foobaz")

      assert ids(MessageQueries.search(user.id, "brown")) == ids([quick_brown_fox])
      assert ids(MessageQueries.search(user.id, "good")) == ids([all_good_men])
      assert ids(MessageQueries.search(user.id, "lorem")) == ids([lorem_ipsum])
      assert ids(MessageQueries.search(user.id, "the")) == ids([all_good_men, quick_brown_fox])
      assert ids(MessageQueries.search(user.id, "brow")) == ids([quick_brown_fox])
      assert ids(MessageQueries.search(user.id, "aide")) == ids([all_good_men])
      assert ids(MessageQueries.search(user.id, "parte")) == ids([all_good_men])
      assert ids(MessageQueries.search(user.id, "consecetur")) == ids([lorem_ipsum])
      assert ids(MessageQueries.search(user.id, "brown fox")) == ids([quick_brown_fox])
      assert ids(MessageQueries.search(user.id, "do")) == ids([lorem_ipsum, quick_brown_fox])
      assert ids(MessageQueries.search(user.id, "foobar")) == ids([foobar, foobaz])
    end

    defp ids(messages) do
      Enum.map(messages, &(&1.id))
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
      insert(:group_user, user: user, group: public_group)
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

  describe "get_uploads_for_user/3" do
    test "returns only uploads user can see with get_uploads_for_user/3" do
      skip = 0
      limit = 5
      team = insert(:team)
      author = insert(:user, team: team)

      public_group = insert(:group, team: team, name: "X", slug: "x", public: true)
      _public_message = insert(:message, user: author, group: public_group, text_content: "Hello, world!")
      public_message2 = insert(:message, user: author, group: public_group, text_content: "Hello, world! upload", type: "upload")

      private_group = insert(:group, team: team, name: "Y", slug: "y", public: false)
      _private_message = insert(:message, user: author, group: private_group, text_content: "Hello, world!")
      private_message2 = insert(:message, user: author, group: private_group, text_content: "Hello, world! upload", type: "upload")

      private_member_group = insert(:group, team: team, name: "Z", slug: "z", public: false)
      insert(:group_user, user: author, group: private_member_group)
      _private_member_message = insert(:message, user: author, group: private_member_group, text_content: "Hello, world!")
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

    test "restricts guests to their restricted groups" do
      team = insert(:team)
      group = insert(:group, team: team)
      message = insert(:message, group: group, type: "upload")
      guest = insert(:user, team: team, roles: ["single-room-guest"], groups_as_guest: [group.id])
      insert(:group_user, group: group, user: guest)

      other_group = insert(:group, team: team)
      insert(:message, group: other_group, type: "upload")

      %Stitch.Paginator{data: result} = Stitch.MessageQueries.get_uploads_for_user(guest, 0, 10)
      assert length(result) == 1
      assert hd(result).id == message.id
    end
  end

  test "user_mentioned_in/2" do
    team = insert(:team)
    group = insert(:group, team: team)
    user = insert(:user, team: team)
    mentioned_user = insert(:user, team: team)
    mentioned_user_ids = [mentioned_user.id]

    max_messages = 50

    for i <- 1..max_messages do
      insert(:message, user: user, group: group, text_content: "@#{mentioned_user.username} #{i}", mentioned_user_ids: mentioned_user_ids)
      insert(:message, user: mentioned_user, group: group, text_content: "#{i}")
    end

    result = Stitch.MessageQueries.user_mentioned_in(mentioned_user)
    assert length(result.data) == 30
    for message <- result.data do
      assert %Stitch.Accounts.User{} = message.user
      assert mentioned_user.id in message.mentioned_user_ids
    end

    result = Stitch.MessageQueries.user_mentioned_in(mentioned_user, limit: 1)
    assert length(result.data) == 1
    assert hd(result.data).text_content =~ " #{max_messages}"

    result = Stitch.MessageQueries.user_mentioned_in(mentioned_user, limit: 1, skip: 1)
    assert length(result.data) == 1
    assert hd(result.data).text_content =~ " #{max_messages - 1}"

    result = Stitch.MessageQueries.user_mentioned_in(user)
    assert result.data == []
  end

  test "pinned_messages/2" do
    team = insert(:team)
    group = insert(:group, team: team)
    user_a = insert(:user, team: team)
    user_b = insert(:user, team: team)

    message_bar = insert(:message, user: user_a, group: group, text_content: "bar")
    message_baz = insert(:message, user: user_b, group: group, text_content: "baz")
    _message_qux = insert(:message, user: user_b, group: group, text_content: "baz")

    assert {:ok, message_bar} = Stitch.MessageAction.toggle_pin(message_bar, user_a)
    assert {:ok, _message_baz} = Stitch.MessageAction.toggle_pin(message_baz, user_b)

    assert %{data: [message], meta: meta} = Stitch.MessageQueries.pinned_messages(group, limit: 1, skip: 1)
    assert %{limit: 1, skip: 1, count: 2} = meta

    assert message.id == message_bar.id
  end

  describe "count/2" do
    test "with user and :all_time" do
      {:ok, user_inserted_at} = NaiveDateTime.new(2016, 12, 25, 0, 0, 0)
      {:ok, datetime_1} = NaiveDateTime.new(2016, 12, 29, 0, 0, 0)
      {:ok, datetime_2} = NaiveDateTime.new(2017, 1, 1, 0, 0, 0)
      {:ok, datetime_3} = NaiveDateTime.new(2017, 1, 25, 0, 0, 0)
      {:ok, end_at} = Date.new(2017, 1, 30)
      team = insert(:team)
      team_2 = insert(:team)
      group_1 = insert(:group, team: team)
      group_2 = insert(:group, team: team)
      group_3 = insert(:group, team: team)
      group_4 = insert(:group, team: team_2)
      user_1 = insert(:user, team: team, inserted_at: user_inserted_at)
      user_2 = insert(:user, team: team)
      user_3 = insert(:user, team: team)
      user_4 = insert(:user, team: team_2)
      insert(:message, user: user_1, group: group_1, inserted_at: datetime_1)
      insert(:message, user: user_1, group: group_2, inserted_at: datetime_3)
      insert(:message, user: user_2, group: group_1, inserted_at: datetime_1) # not the target user
      insert(:message, user: user_3, group: group_2, inserted_at: datetime_1) # not the target user
      insert(:message, user: user_2, group: group_3, inserted_at: datetime_2) # not the target user
      insert(:message, user: user_3, group: group_3, inserted_at: datetime_2) # not the target user
      insert(:message, user: user_3, group: group_3, inserted_at: datetime_3) # not the target user
      insert(:message, user: user_4, group: group_4, inserted_at: datetime_1) # not the target user

      opts = %{time_period: :all_time, end_at: end_at}
      message_count = Stitch.MessageQueries.count(user_1, opts)

      assert message_count == 2
    end

    test "with user and :last_day" do
      {:ok, user_inserted_at} = NaiveDateTime.new(2016, 12, 25, 0, 0, 0)
      {:ok, datetime_1} = NaiveDateTime.new(2016, 12, 29, 0, 0, 0)
      {:ok, datetime_2} = NaiveDateTime.new(2017, 1, 1, 0, 0, 0)
      {:ok, datetime_3} = NaiveDateTime.new(2017, 1, 30, 0, 0, 0)
      {:ok, end_at} = Date.new(2017, 1, 30)
      team = insert(:team)
      team_2 = insert(:team)
      group_1 = insert(:group, team: team)
      group_2 = insert(:group, team: team)
      group_3 = insert(:group, team: team)
      group_4 = insert(:group, team: team_2)
      user_1 = insert(:user, team: team, inserted_at: user_inserted_at)
      user_2 = insert(:user, team: team)
      user_3 = insert(:user, team: team)
      user_4 = insert(:user, team: team_2)
      insert(:message, user: user_1, group: group_1, inserted_at: datetime_1) # not in the 'last day'
      insert(:message, user: user_1, group: group_2, inserted_at: datetime_3)
      insert(:message, user: user_1, group: group_2, inserted_at: datetime_3)
      insert(:message, user: user_1, group: group_2, inserted_at: datetime_3)
      insert(:message, user: user_2, group: group_1, inserted_at: datetime_1) # not the target user
      insert(:message, user: user_3, group: group_2, inserted_at: datetime_1) # not the target user
      insert(:message, user: user_2, group: group_3, inserted_at: datetime_2) # not the target user
      insert(:message, user: user_3, group: group_3, inserted_at: datetime_2) # not the target user
      insert(:message, user: user_3, group: group_3, inserted_at: datetime_3) # not the target user
      insert(:message, user: user_4, group: group_4, inserted_at: datetime_1) # not the targer user

      opts = %{time_period: :last_day, end_at: end_at}
      message_count = Stitch.MessageQueries.count(user_1, opts)

      assert message_count == 3
    end

    test "with user and :last_7_days" do
      {:ok, user_inserted_at} = NaiveDateTime.new(2016, 12, 25, 0, 0, 0)
      {:ok, datetime_1} = NaiveDateTime.new(2016, 12, 29, 0, 0, 0)
      {:ok, datetime_2} = NaiveDateTime.new(2017, 1, 24, 0, 0, 0)
      {:ok, datetime_3} = NaiveDateTime.new(2017, 1, 30, 0, 0, 0)
      {:ok, end_at} = Date.new(2017, 1, 30)
      team = insert(:team)
      team_2 = insert(:team)
      group_1 = insert(:group, team: team)
      group_2 = insert(:group, team: team)
      group_3 = insert(:group, team: team)
      group_4 = insert(:group, team: team_2)
      user_1 = insert(:user, team: team, inserted_at: user_inserted_at)
      user_2 = insert(:user, team: team)
      user_3 = insert(:user, team: team)
      user_4 = insert(:user, team: team_2)
      insert(:message, user: user_1, group: group_1, inserted_at: datetime_1) # not in the 'last 7 days'
      insert(:message, user: user_1, group: group_2, inserted_at: datetime_2)
      insert(:message, user: user_1, group: group_2, inserted_at: datetime_2)
      insert(:message, user: user_1, group: group_2, inserted_at: datetime_3)
      insert(:message, user: user_1, group: group_2, inserted_at: datetime_3)
      insert(:message, user: user_2, group: group_1, inserted_at: datetime_1) # not the target user
      insert(:message, user: user_2, group: group_3, inserted_at: datetime_2) # not the target user
      insert(:message, user: user_3, group: group_2, inserted_at: datetime_1) # not the target user
      insert(:message, user: user_3, group: group_3, inserted_at: datetime_2) # not the target user
      insert(:message, user: user_3, group: group_3, inserted_at: datetime_3) # not the target user
      insert(:message, user: user_4, group: group_4, inserted_at: datetime_3) # not the target user

      opts = %{time_period: :last_7_days, end_at: end_at}
      message_count = Stitch.MessageQueries.count(user_1, opts)

      assert message_count == 4
    end

    test "with user and :last_30_days" do
      {:ok, user_inserted_at} = NaiveDateTime.new(2016, 12, 25, 0, 0, 0)
      {:ok, datetime_1} = NaiveDateTime.new(2016, 12, 31, 0, 0, 0)
      {:ok, datetime_2} = NaiveDateTime.new(2017, 1, 1, 0, 0, 0)
      {:ok, datetime_3} = NaiveDateTime.new(2017, 1, 24, 0, 0, 0)
      {:ok, datetime_4} = NaiveDateTime.new(2017, 1, 30, 0, 0, 0)
      {:ok, end_at} = Date.new(2017, 1, 30)
      team = insert(:team)
      team_2 = insert(:team)
      group_1 = insert(:group, team: team)
      group_2 = insert(:group, team: team)
      group_3 = insert(:group, team: team)
      group_4 = insert(:group, team: team_2)
      user_1 = insert(:user, team: team, inserted_at: user_inserted_at)
      user_2 = insert(:user, team: team)
      user_3 = insert(:user, team: team)
      user_4 = insert(:user, team: team_2)
      insert(:message, user: user_1, group: group_1, inserted_at: datetime_1) # not in the 'last 30 days'
      insert(:message, user: user_1, group: group_2, inserted_at: datetime_2)
      insert(:message, user: user_1, group: group_2, inserted_at: datetime_2)
      insert(:message, user: user_1, group: group_2, inserted_at: datetime_3)
      insert(:message, user: user_1, group: group_2, inserted_at: datetime_4)
      insert(:message, user: user_1, group: group_2, inserted_at: datetime_4)
      insert(:message, user: user_2, group: group_1, inserted_at: datetime_2) # not the target user
      insert(:message, user: user_3, group: group_2, inserted_at: datetime_2) # not the target user
      insert(:message, user: user_2, group: group_3, inserted_at: datetime_2) # not the target user
      insert(:message, user: user_3, group: group_3, inserted_at: datetime_2) # not the target user
      insert(:message, user: user_3, group: group_3, inserted_at: datetime_3) # not the target user
      insert(:message, user: user_4, group: group_4, inserted_at: datetime_2) # not the target user

      opts = %{time_period: :last_30_days, end_at: end_at}
      message_count = Stitch.MessageQueries.count(user_1, opts)

      assert message_count == 5
    end

    test "with team and :all_time" do
      {:ok, team_inserted_at} = NaiveDateTime.new(2016, 12, 25, 0, 0, 0)
      {:ok, datetime_1} = NaiveDateTime.new(2016, 12, 29, 0, 0, 0)
      {:ok, datetime_2} = NaiveDateTime.new(2017, 1, 1, 0, 0, 0)
      {:ok, datetime_3} = NaiveDateTime.new(2017, 1, 25, 0, 0, 0)
      {:ok, end_at} = Date.new(2017, 1, 30)
      team = insert(:team, inserted_at: team_inserted_at)
      team_2 = insert(:team)
      group_1 = insert(:group, team: team)
      group_2 = insert(:group, team: team)
      group_3 = insert(:group, team: team_2)
      group_4 = insert(:group, team: team_2)
      user_1 = insert(:user, team: team)
      user_2 = insert(:user, team: team)
      user_3 = insert(:user, team: team_2)
      user_4 = insert(:user, team: team_2)
      insert(:message, user: user_1, group: group_1, inserted_at: datetime_1)
      insert(:message, user: user_1, group: group_2, inserted_at: datetime_3)
      insert(:message, user: user_2, group: group_1, inserted_at: datetime_1)
      insert(:message, user: user_3, group: group_2, inserted_at: datetime_1)
      insert(:message, user: user_2, group: group_2, inserted_at: datetime_2)
      insert(:message, user: user_3, group: group_3, inserted_at: datetime_2) # not the target team
      insert(:message, user: user_4, group: group_4, inserted_at: datetime_3) # not the target team

      opts = %{time_period: :all_time, end_at: end_at}
      message_count = Stitch.MessageQueries.count(team, opts)

      assert message_count == 5
    end

    test "with team and :last_day" do
      {:ok, team_inserted_at} = NaiveDateTime.new(2016, 12, 25, 0, 0, 0)
      {:ok, datetime_1} = NaiveDateTime.new(2016, 12, 29, 0, 0, 0)
      {:ok, datetime_2} = NaiveDateTime.new(2017, 1, 1, 0, 0, 0)
      {:ok, datetime_3} = NaiveDateTime.new(2017, 1, 30, 0, 0, 0)
      {:ok, end_at} = Date.new(2017, 1, 30)
      team = insert(:team, inserted_at: team_inserted_at)
      team_2 = insert(:team)
      group_1 = insert(:group, team: team)
      group_2 = insert(:group, team: team)
      group_3 = insert(:group, team: team_2)
      group_4 = insert(:group, team: team_2)
      user_1 = insert(:user, team: team)
      user_2 = insert(:user, team: team)
      user_3 = insert(:user, team: team_2)
      user_4 = insert(:user, team: team_2)
      insert(:message, user: user_1, group: group_1, inserted_at: datetime_1) # not in 'last day'
      insert(:message, user: user_1, group: group_1, inserted_at: datetime_3)
      insert(:message, user: user_1, group: group_2, inserted_at: datetime_3)
      insert(:message, user: user_2, group: group_1, inserted_at: datetime_1) # not in 'last day'
      insert(:message, user: user_2, group: group_2, inserted_at: datetime_2) # not in 'last day'
      insert(:message, user: user_2, group: group_1, inserted_at: datetime_3)
      insert(:message, user: user_2, group: group_2, inserted_at: datetime_3)
      insert(:message, user: user_3, group: group_2, inserted_at: datetime_1) # not in 'last day'
      insert(:message, user: user_3, group: group_3, inserted_at: datetime_2) # not the target team or in the 'last day'
      insert(:message, user: user_4, group: group_4, inserted_at: datetime_3) # not the target team

      opts = %{time_period: :last_day, end_at: end_at}
      message_count = Stitch.MessageQueries.count(team, opts)

      assert message_count == 4
    end

    test "with team and :last_7_days" do
      {:ok, team_inserted_at} = NaiveDateTime.new(2016, 12, 25, 0, 0, 0)
      {:ok, datetime_1} = NaiveDateTime.new(2017, 1, 23, 0, 0, 0)
      {:ok, datetime_2} = NaiveDateTime.new(2017, 1, 24, 0, 0, 0)
      {:ok, datetime_3} = NaiveDateTime.new(2017, 1, 30, 0, 0, 0)
      {:ok, end_at} = Date.new(2017, 1, 30)
      team = insert(:team, inserted_at: team_inserted_at)
      team_2 = insert(:team)
      group_1 = insert(:group, team: team)
      group_2 = insert(:group, team: team)
      group_3 = insert(:group, team: team_2)
      group_4 = insert(:group, team: team_2)
      user_1 = insert(:user, team: team)
      user_2 = insert(:user, team: team)
      user_3 = insert(:user, team: team_2)
      user_4 = insert(:user, team: team_2)
      insert(:message, user: user_1, group: group_1, inserted_at: datetime_1) # not in 'last day'
      insert(:message, user: user_1, group: group_1, inserted_at: datetime_3)
      insert(:message, user: user_1, group: group_2, inserted_at: datetime_3)
      insert(:message, user: user_2, group: group_1, inserted_at: datetime_1) # not in 'last day'
      insert(:message, user: user_2, group: group_1, inserted_at: datetime_3)
      insert(:message, user: user_2, group: group_2, inserted_at: datetime_3)
      insert(:message, user: user_2, group: group_2, inserted_at: datetime_2)
      insert(:message, user: user_3, group: group_2, inserted_at: datetime_1) # not in 'last 7 days'
      insert(:message, user: user_3, group: group_3, inserted_at: datetime_2) # not the target team
      insert(:message, user: user_4, group: group_4, inserted_at: datetime_3) # not the target team

      opts = %{time_period: :last_7_days, end_at: end_at}
      message_count = Stitch.MessageQueries.count(team, opts)

      assert message_count == 5
    end

    test "with team and :last_30_days" do
      {:ok, team_inserted_at} = NaiveDateTime.new(2016, 12, 25, 0, 0, 0)
      {:ok, datetime_1} = NaiveDateTime.new(2016, 12, 29, 0, 0, 0)
      {:ok, datetime_2} = NaiveDateTime.new(2016, 1, 30, 0, 0, 0)
      {:ok, datetime_3} = NaiveDateTime.new(2017, 1, 1, 0, 0, 0)
      {:ok, datetime_4} = NaiveDateTime.new(2017, 1, 12, 0, 0, 0)
      {:ok, datetime_5} = NaiveDateTime.new(2017, 1, 30, 0, 0, 0)
      {:ok, end_at} = Date.new(2017, 1, 30)
      team = insert(:team, inserted_at: team_inserted_at)
      team_2 = insert(:team)
      group_1 = insert(:group, team: team)
      group_2 = insert(:group, team: team)
      group_3 = insert(:group, team: team_2)
      group_4 = insert(:group, team: team_2)
      user_1 = insert(:user, team: team)
      user_2 = insert(:user, team: team)
      user_3 = insert(:user, team: team_2)
      user_4 = insert(:user, team: team_2)
      insert(:message, user: user_1, group: group_1, inserted_at: datetime_1) # not in 'last 30 days'
      insert(:message, user: user_1, group: group_1, inserted_at: datetime_2) # not in 'last 30 days'
      insert(:message, user: user_1, group: group_1, inserted_at: datetime_3)
      insert(:message, user: user_1, group: group_2, inserted_at: datetime_3)
      insert(:message, user: user_1, group: group_1, inserted_at: datetime_4)
      insert(:message, user: user_1, group: group_2, inserted_at: datetime_5)
      insert(:message, user: user_2, group: group_1, inserted_at: datetime_1) # not in 'last day'
      insert(:message, user: user_2, group: group_1, inserted_at: datetime_3)
      insert(:message, user: user_2, group: group_2, inserted_at: datetime_3)
      insert(:message, user: user_2, group: group_1, inserted_at: datetime_4)
      insert(:message, user: user_2, group: group_2, inserted_at: datetime_5)
      insert(:message, user: user_2, group: group_2, inserted_at: datetime_2) # not in the 'last 30 days'
      insert(:message, user: user_3, group: group_2, inserted_at: datetime_1) # not in 'last 30 days
      insert(:message, user: user_3, group: group_3, inserted_at: datetime_2) # not the target team
      insert(:message, user: user_4, group: group_4, inserted_at: datetime_3) # not the target team
      insert(:message, user: user_4, group: group_4, inserted_at: datetime_4) # not the target team
      insert(:message, user: user_4, group: group_4, inserted_at: datetime_5) # not the target team

      opts = %{time_period: :last_30_days, end_at: end_at}
      message_count = Stitch.MessageQueries.count(team, opts)

      assert message_count == 8
    end
  end

  describe "last_occurred/1" do
    test "with user" do
      {:ok, datetime_1} = NaiveDateTime.new(2016, 12, 29, 0, 0, 0)
      {:ok, datetime_2} = NaiveDateTime.new(2017, 1, 12, 0, 0, 0)
      {:ok, datetime_3} = NaiveDateTime.new(2017, 1, 20, 0, 0, 0)
      {:ok, datetime_4} = NaiveDateTime.new(2017, 1, 30, 0, 0, 0)
      {:ok, datetime_5} = NaiveDateTime.new(2017, 2, 5, 0, 0, 0)
      team = insert(:team)
      team_2 = insert(:team)
      user_1 = insert(:user, team: team)
      user_2 = insert(:user, team: team)
      user_3 = insert(:user, team: team_2)
      group_1 = insert(:group, team: team)
      group_2 = insert(:group, team: team_2)
      insert(:message, user: user_1, group: group_1, inserted_at: datetime_1)
      insert(:message, user: user_1, group: group_1, inserted_at: datetime_4)
      insert(:message, user: user_1, group: group_1, inserted_at: datetime_3)
      insert(:message, user: user_2, group: group_1, inserted_at: datetime_1)
      insert(:message, user: user_2, group: group_1, inserted_at: datetime_4)
      insert(:message, user: user_2, group: group_1, inserted_at: datetime_5)
      insert(:message, user: user_3, group: group_2, inserted_at: datetime_2)
      insert(:message, user: user_3, group: group_2, inserted_at: datetime_4)

      last_occurred_at = Stitch.MessageQueries.last_occurred_at(user_1)

      assert last_occurred_at.year == datetime_4.year
      assert last_occurred_at.month == datetime_4.month
      assert last_occurred_at.day == datetime_4.day
    end

    test "with team" do
      {:ok, datetime_1} = NaiveDateTime.new(2016, 12, 29, 0, 0, 0)
      {:ok, datetime_2} = NaiveDateTime.new(2017, 1, 12, 0, 0, 0)
      {:ok, datetime_3} = NaiveDateTime.new(2017, 1, 20, 0, 0, 0)
      {:ok, datetime_4} = NaiveDateTime.new(2017, 1, 30, 0, 0, 0)
      {:ok, datetime_5} = NaiveDateTime.new(2017, 2, 5, 0, 0, 0)
      team = insert(:team)
      team_2 = insert(:team)
      user_1 = insert(:user, team: team)
      user_2 = insert(:user, team: team)
      user_3 = insert(:user, team: team_2)
      group_1 = insert(:group, team: team)
      group_2 = insert(:group, team: team_2)
      insert(:message, user: user_1, group: group_1, inserted_at: datetime_1)
      insert(:message, user: user_1, group: group_1, inserted_at: datetime_4)
      insert(:message, user: user_1, group: group_1, inserted_at: datetime_3)
      insert(:message, user: user_2, group: group_1, inserted_at: datetime_1)
      insert(:message, user: user_2, group: group_1, inserted_at: datetime_4)
      insert(:message, user: user_2, group: group_1, inserted_at: datetime_5)
      insert(:message, user: user_3, group: group_2, inserted_at: datetime_2)
      insert(:message, user: user_3, group: group_2, inserted_at: datetime_4)

      last_occurred_at = Stitch.MessageQueries.last_occurred_at(team)

      assert last_occurred_at.year == datetime_5.year
      assert last_occurred_at.month == datetime_5.month
      assert last_occurred_at.day == datetime_5.day
    end

    test "user and team with no messages" do
      user = insert(:user)
      team = insert(:team)
      refute Stitch.MessageQueries.last_occurred_at(user)
      refute Stitch.MessageQueries.last_occurred_at(team)
    end
  end
end
