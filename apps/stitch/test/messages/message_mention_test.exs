defmodule Stitch.Message.MentionTest do
  use ExUnit.Case, async: true
  import Stitch.Factory
  alias Stitch.Repo
  alias Stitch.GroupUser

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  test "Stitch.Mention.user_mention_keywords/1" do
    bob = insert(:user, username: "bob")
    alice = insert(:user, username: "alice")

    mention_keywords = Stitch.Message.Mention.user_mention_keywords([bob, alice])

    assert mention_keywords == %{
      "@bob" => [bob.id],
      "@alice" => [alice.id],
      "@all" => [bob.id, alice.id],
    }
  end

  describe "Stitch.Message.get_mentions/2" do
    test "when message contains no mentions" do
      assert Stitch.Message.Mention.message_mentions("Hello, bob.", %{"@bob" => [1, 2]}) == []
    end

    test "when user is mentioned" do
      mentions = Stitch.Message.Mention.message_mentions("Hello, @bob", %{"@bob" => [1, 2]})
      assert mentions == [1, 2]
    end

    test "when one user out of many is mentioned" do
      mentions = Stitch.Message.Mention.message_mentions("Hello, @bob", %{"@bob" => [1], "@alice" => [2]})
      assert mentions == [1]
    end

    test "when keyword is followed by a punctuation mark" do
      assert Stitch.Message.Mention.message_mentions("Hello, @bob!", %{"@bob" => [1]}) == [1]
      assert Stitch.Message.Mention.message_mentions("Hello, @bob.", %{"@bob" => [1]}) == [1]
      assert Stitch.Message.Mention.message_mentions("Hello, @bob,", %{"@bob" => [1]}) == [1]
      assert Stitch.Message.Mention.message_mentions("(Hello, @bob)", %{"@bob" => [1]}) == [1]
      assert Stitch.Message.Mention.message_mentions("(Hello, @bob:", %{"@bob" => [1]}) == [1]
    end

    test "when multiple users are mentioned" do
      assert Stitch.Message.Mention.message_mentions("Hello, @bob and @alice!", %{"@bob" => [1], "@alice" => [2]}) == [1, 2]
    end

    test "when users' mention keywords overlap" do
      assert Stitch.Message.Mention.message_mentions("Hello, @bob, @alice, and eve.", %{"@bob" => [1], "@alice" => [2], "eve" => [1, 2, 3]}) == [1, 2, 3]
    end

    test "when username contains a punctuation mark" do
      assert Stitch.Message.Mention.message_mentions("Hello, @bob.a", %{"@bob.a" => [1]}) == [1]
    end

    test "when @all is mentioned" do
      assert Stitch.Message.Mention.message_mentions("Hello, @all!", %{"@all" => [1, 2, 3]}) == [1, 2, 3]
    end

    test "exclude when author is mentioned" do
      # TODO
    end
  end

  describe "Message.create should trigger counter updates in the corresponding group_user records" do
    test "when one user is mentioned" do
      bob = insert(:user, username: "bob")
      alice = insert(:user, username: "alice")
      group = insert(:group)
      group_bob = insert(:group_user, user: bob, group: group)
      group_alice = insert(:group_user, user: alice, group: group)

      {:ok, message} = Stitch.Message.create(to_string(group.id), bob.id, %{"text_content" => "Hello, @alice.", "type" => "user_message"})

      group_bob = Repo.get(GroupUser, group_bob.id)
      group_alice = Repo.get(GroupUser, group_alice.id)

      assert group_bob.mentioning_message_ids == %{}
      assert group_alice.mentioning_message_ids[to_string(message.id)] == "true"
    end

    test "when two users are mentioned" do
      bob = insert(:user, username: "bob")
      alice = insert(:user, username: "alice")
      group = insert(:group)
      group_bob = insert(:group_user, user: bob, group: group)
      group_alice = insert(:group_user, user: alice, group: group)

      {:ok, message} = Stitch.Message.create(to_string(group.id), alice.id, %{"text_content" => "Hello, @alice, and @bob.", "type" => "user_message"})

      group_bob = Repo.get(GroupUser, group_bob.id)
      group_alice = Repo.get(GroupUser, group_alice.id)

      assert group_bob.mentioning_message_ids[to_string(message.id)] == "true"
      assert group_alice.mentioning_message_ids[to_string(message.id)] == "true"
    end

    test "when @all is mentioned" do
      bob = insert(:user, username: "bob")
      alice = insert(:user, username: "alice")
      eve = insert(:user, username: "eve")
      group = insert(:group)
      group_bob = insert(:group_user, user: bob, group: group)
      group_alice = insert(:group_user, user: alice, group: group)
      group_eve = insert(:group_user, user: eve, group: group)

      {:ok, message} = Stitch.Message.create(to_string(group.id), eve.id, %{"text_content" => "Hi, @all!", "type" => "user_message"})

      group_bob = Repo.get(GroupUser, group_bob.id)
      group_alice = Repo.get(GroupUser, group_alice.id)
      group_eve = Repo.get(GroupUser, group_eve.id)

      assert group_bob.mentioning_message_ids[to_string(message.id)] == "true"
      assert group_alice.mentioning_message_ids[to_string(message.id)] == "true"
      assert group_eve.mentioning_message_ids[to_string(message.id)] == "true"
    end
  end

  describe "Message.update should update the corresponding group_user counters" do
    test "when user is not mentioned in the new message edit" do
      bob = insert(:user, username: "bob")
      alice = insert(:user, username: "alice")
      group = insert(:group)
      group_bob = insert(:group_user, user: bob, group: group)
      group_alice = insert(:group_user, user: alice, group: group)

      {:ok, message} = Stitch.Message.create(to_string(group.id), bob.id, %{"text_content" => "Hello, @alice.", "type" => "user_message"})

      group_bob = Repo.get(GroupUser, group_bob.id)
      group_alice = Repo.get(GroupUser, group_alice.id)

      assert group_bob.mentioning_message_ids == %{}
      assert group_alice.mentioning_message_ids[to_string(message.id)] == "true"

      {:ok, message} = Stitch.Message.update(message, %{"text_content" => "Hello.", "type" => "user_message"})

      group_bob = Repo.get(GroupUser, group_bob.id)
      group_alice = Repo.get(GroupUser, group_alice.id)

      assert group_bob.mentioning_message_ids == %{}
      assert group_alice.mentioning_message_ids == %{}
    end

    test "when new user is mentioned in the new message edit" do
      bob = insert(:user, username: "bob")
      alice = insert(:user, username: "alice")
      group = insert(:group)
      group_bob = insert(:group_user, user: bob, group: group)
      group_alice = insert(:group_user, user: alice, group: group)

      {:ok, message} = Stitch.Message.create(to_string(group.id), bob.id, %{"text_content" => "Hello.", "type" => "user_message"})

      group_bob = Repo.get(GroupUser, group_bob.id)
      group_alice = Repo.get(GroupUser, group_alice.id)

      assert group_bob.mentioning_message_ids == %{}
      assert group_alice.mentioning_message_ids == %{}

      {:ok, message} = Stitch.Message.update(message, %{"text_content" => "Hello, @alice.", "type" => "user_message"})

      group_bob = Repo.get(GroupUser, group_bob.id)
      group_alice = Repo.get(GroupUser, group_alice.id)

      assert group_bob.mentioning_message_ids == %{}
      assert group_alice.mentioning_message_ids[to_string(message.id)] == "true"
    end
  end

  test "Message.delete should decrement the corresponding group_user counters" do
    bob = insert(:user, username: "bob")
    alice = insert(:user, username: "alice")
    group = insert(:group)
    group_bob = insert(:group_user, user: bob, group: group)
    group_alice = insert(:group_user, user: alice, group: group)

    {:ok, message} = Stitch.Message.create(to_string(group.id), bob.id, %{"text_content" => "Hello, @alice.", "type" => "user_message"})

    group_bob = Repo.get(GroupUser, group_bob.id)
    group_alice = Repo.get(GroupUser, group_alice.id)

    assert group_bob.mentioning_message_ids == %{}
    assert group_alice.mentioning_message_ids[to_string(message.id)] == "true"

    {:ok, message} = Stitch.Message.delete(message)

    group_bob = Repo.get(GroupUser, group_bob.id)
    group_alice = Repo.get(GroupUser, group_alice.id)

    assert group_bob.mentioning_message_ids == %{}
    assert group_alice.mentioning_message_ids == %{}
  end
end
