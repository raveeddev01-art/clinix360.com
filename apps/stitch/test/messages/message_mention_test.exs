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
    eve = insert(:user, username: "eve")

    mention_keywords = Stitch.Message.Mention.user_mention_keywords([bob, alice, eve], eve)

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

  describe "Message.create/3 should trigger counter updates in the corresponding group_user records" do
    test "when one user is mentioned" do
      bob = insert(:user, username: "bob")
      alice = insert(:user, username: "alice")
      group = insert(:group)
      group_bob = insert(:group_user, user: bob, group: group)
      group_alice = insert(:group_user, user: alice, group: group)

      {:ok, message} = Stitch.Message.create(group.id, bob, %{"text_content" => "Hello, @alice.", "type" => "chat"})

      group_bob = Repo.get(GroupUser, group_bob.id)
      group_alice = Repo.get(GroupUser, group_alice.id)

      assert group_bob.mentioning_message_ids == %{}
      assert group_alice.mentioning_message_ids[to_string(message.id)] == "true"
    end

    test "when two users are mentioned" do
      team = insert(:team)
      bob = insert(:user, username: "bob", team: team)
      alice = insert(:user, username: "alice", team: team)
      eve = insert(:user, username: "eve", team: team)
      group = insert(:group, slug: "general", team: team)
      group_bob = insert(:group_user, user: bob, group: group)
      group_alice = insert(:group_user, user: alice, group: group)
      group_eve = insert(:group_user, user: eve, group: group)

      {:ok, message} = Stitch.Message.create(group.id, eve, %{"text_content" => "Hello, @alice, and @bob.", "type" => "chat"})

      group_bob = Repo.get(GroupUser, group_bob.id)
      group_alice = Repo.get(GroupUser, group_alice.id)

      assert group_bob.mentioning_message_ids[to_string(message.id)] == "true"
      assert group_alice.mentioning_message_ids[to_string(message.id)] == "true"

      assert [%{mentions_count: 1, slug: "general"}] = Stitch.GroupQueries.available_groups(alice)
      assert [%{mentions_count: 1, slug: "general"}] = Stitch.GroupQueries.available_groups(bob)
    end

    test "when @all is mentioned" do
      team = insert(:team)
      bob = insert(:user, username: "bob", team: team)
      alice = insert(:user, username: "alice", team: team)
      eve = insert(:user, username: "eve", team: team)
      group = insert(:group, slug: "general", team: team)
      group_bob = insert(:group_user, user: bob, group: group)
      group_alice = insert(:group_user, user: alice, group: group)
      group_eve = insert(:group_user, user: eve, group: group)

      {:ok, message} = Stitch.Message.create(group.id, eve, %{"text_content" => "Hi, @all!", "type" => "chat"})

      group_bob = Repo.get(GroupUser, group_bob.id)
      group_alice = Repo.get(GroupUser, group_alice.id)
      group_eve = Repo.get(GroupUser, group_eve.id)

      assert group_bob.mentioning_message_ids[to_string(message.id)] == "true"
      assert group_alice.mentioning_message_ids[to_string(message.id)] == "true"
      assert group_eve.mentioning_message_ids[to_string(message.id)] == nil

      assert available_groups_indexed_by_slug(bob)["general"].mentions_count == 1
      assert available_groups_indexed_by_slug(alice)["general"].mentions_count == 1
      assert available_groups_indexed_by_slug(eve)["general"].mentions_count == 0
    end
  end

  describe "Message.update/2 should update the corresponding group_user counters" do
    test "when user is not mentioned in the new message edit" do
      team = insert(:team)
      bob = insert(:user, username: "bob", team: team)
      alice = insert(:user, username: "alice", team: team)
      group = insert(:group, slug: "general", team: team)
      group_bob = insert(:group_user, user: bob, group: group)
      group_alice = insert(:group_user, user: alice, group: group)

      {:ok, message} = Stitch.Message.create(group.id, bob, %{"text_content" => "Hello, @alice.", "type" => "chat"})

      group_bob = Repo.get(GroupUser, group_bob.id)
      group_alice = Repo.get(GroupUser, group_alice.id)

      assert group_bob.mentioning_message_ids == %{}
      assert group_alice.mentioning_message_ids[to_string(message.id)] == "true"
      assert available_groups_indexed_by_slug(alice)["general"].mentions_count == 1

      {:ok, _message} = Stitch.Message.update(message, %{"text_content" => "Hello.", "type" => "chat"})

      group_bob = Repo.get(GroupUser, group_bob.id)
      group_alice = Repo.get(GroupUser, group_alice.id)

      assert group_bob.mentioning_message_ids == %{}
      assert group_alice.mentioning_message_ids == %{}
      assert available_groups_indexed_by_slug(alice)["general"].mentions_count == 0
    end

    test "when new user is mentioned in the new message edit" do
      team = insert(:team)
      bob = insert(:user, username: "bob", team: team)
      alice = insert(:user, username: "alice", team: team)
      group = insert(:group, slug: "general", team: team)
      group_bob = insert(:group_user, user: bob, group: group)
      group_alice = insert(:group_user, user: alice, group: group)

      {:ok, message} = Stitch.Message.create(group.id, bob, %{"text_content" => "Hello.", "type" => "chat"})

      group_bob = Repo.get(GroupUser, group_bob.id)
      group_alice = Repo.get(GroupUser, group_alice.id)

      assert group_bob.mentioning_message_ids == %{}
      assert group_alice.mentioning_message_ids == %{}
      assert available_groups_indexed_by_slug(alice)["general"].mentions_count == 0

      {:ok, message} = Stitch.Message.update(message, %{"text_content" => "Hello, @alice.", "type" => "chat"})

      group_bob = Repo.get(GroupUser, group_bob.id)
      group_alice = Repo.get(GroupUser, group_alice.id)

      assert group_bob.mentioning_message_ids == %{}
      assert group_alice.mentioning_message_ids[to_string(message.id)] == "true"
      assert available_groups_indexed_by_slug(alice)["general"].mentions_count == 1
    end
  end

  test "Message.delete/1 should decrement the corresponding group_user counters" do
    team = insert(:team)
    bob = insert(:user, username: "bob", team: team)
    alice = insert(:user, username: "alice", team: team)
    group = insert(:group, slug: "general", team: team)
    group_bob = insert(:group_user, user: bob, group: group)
    group_alice = insert(:group_user, user: alice, group: group)

    {:ok, message} = Stitch.Message.create(group.id, bob, %{"text_content" => "Hello, @alice.", "type" => "chat"})

    group_bob = Repo.get(GroupUser, group_bob.id)
    group_alice = Repo.get(GroupUser, group_alice.id)

    assert group_bob.mentioning_message_ids == %{}
    assert group_alice.mentioning_message_ids[to_string(message.id)] == "true"
    assert available_groups_indexed_by_slug(alice)["general"].mentions_count == 1

    {:ok, _message} = Stitch.Message.delete(message)

    group_bob = Repo.get(GroupUser, group_bob.id)
    group_alice = Repo.get(GroupUser, group_alice.id)

    assert group_bob.mentioning_message_ids == %{}
    assert group_alice.mentioning_message_ids == %{}
    assert available_groups_indexed_by_slug(alice)["general"].mentions_count == 0
  end

  test "Message.read_mentions/3 decrements mention counters" do
    team = insert(:team)
    bob = insert(:user, username: "bob", team: team)
    alice = insert(:user, username: "alice", team: team)
    group = insert(:group, slug: "general", team: team)
    group_bob = insert(:group_user, user: bob, group: group)
    group_alice = insert(:group_user, user: alice, group: group)

    {:ok, message_a} = Stitch.Message.create(group.id, alice, %{"text_content" => "Hello, @bob.", "type" => "chat"})
    {:ok, message_b} = Stitch.Message.create(group.id, alice, %{"text_content" => "Hello.", "type" => "chat"})

    assert Repo.get(GroupUser, group_bob.id).mentioning_message_ids[to_string(message_a.id)] == "true"
    Stitch.Message.read_mentions(group, bob, [message_b.id])
    assert Repo.get(GroupUser, group_bob.id).mentioning_message_ids[to_string(message_a.id)] == "true"
    Stitch.Message.read_mentions(group, bob, [message_a.id])
    assert Repo.get(GroupUser, group_bob.id).mentioning_message_ids == %{}
  end

  defp available_groups_indexed_by_slug(user) do
    user
    |> Stitch.GroupQueries.available_groups
    |> Enum.reduce(%{}, &Map.put(&2, &1.slug, &1))
  end
end
