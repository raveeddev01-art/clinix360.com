defmodule Stitch.Message.MentionTest do
  use ExUnit.Case, async: true
  import Stitch.Factory
  alias Stitch.Repo
  alias Stitch.GroupUser

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  test "Stitch.Mention.user_mention_keywords/1 (excludes author)" do
    bob = insert(:user, username: "bob")
    alice = insert(:user, username: "alice")
    eve = insert(:user, username: "eve")

    mention_keywords = Stitch.Message.Mention.user_mention_keywords([bob, alice, eve], eve)

    assert mention_keywords["<@U#{bob.id}>"] == [bob.id]
    assert mention_keywords["<@U#{alice.id}>"] == [alice.id]
    assert mention_keywords["@all"] == [bob.id, alice.id]
  end

  describe "Stitch.Message.get_mentions/2" do
    test "when message contains no mentions" do
      assert Stitch.Message.Mention.message_mentions("Hello, bob.", %{"<@U#{123}>" => [1, 2]}) == []
    end

    test "when user is mentioned" do
      mentions = Stitch.Message.Mention.message_mentions("Hello, <@U123>", %{"<@U123>" => [1, 2]})
      assert mentions == [1, 2]
    end

    test "when one user out of many is mentioned" do
      mentions = Stitch.Message.Mention.message_mentions("Hello, <@U123>", %{"<@U123>" => [1], "@alice" => [2]})
      assert mentions == [1]
    end

    test "when keyword is followed by a punctuation mark" do
      assert Stitch.Message.Mention.message_mentions("Hello, <@U123>!", %{"<@U123>" => [1]}) == [1]
      assert Stitch.Message.Mention.message_mentions("Hello, <@U123>.", %{"<@U123>" => [1]}) == [1]
      assert Stitch.Message.Mention.message_mentions("Hello, <@U123>,", %{"<@U123>" => [1]}) == [1]
      assert Stitch.Message.Mention.message_mentions("(Hello, <@U123>)", %{"<@U123>" => [1]}) == [1]
      assert Stitch.Message.Mention.message_mentions("(Hello, <@U123>:", %{"<@U123>" => [1]}) == [1]
    end

    test "when multiple users are mentioned" do
      assert Stitch.Message.Mention.message_mentions("Hello, <@U123> and <@U1234>!", %{"<@U123>" => [1], "<@U1234>" => [2]}) == [1, 2]
    end

    test "when users' mention keywords overlap" do
      assert Stitch.Message.Mention.message_mentions("Hello, <@U123>, <@U1234>, and eve.", %{"<@U123>" => [1], "<@U1234>" => [2], "eve" => [1, 2, 3]}) == [1, 2, 3]
    end

    test "when username contains a punctuation mark" do
      assert Stitch.Message.Mention.message_mentions("Hello, <@U123>.a", %{"<@U123>.a" => [1]}) == [1]
    end

    test "when @all is mentioned" do
      assert Stitch.Message.Mention.message_mentions("Hello, @all!", %{"@all" => [1, 2, 3]}) == [1, 2, 3]
    end
  end

  describe "Message.create/3 should trigger counter updates in the corresponding group_user records" do
    test "when one user is mentioned" do
      team = insert(:team)
      bob = insert(:user, team: team, username: "bob")
      alice = insert(:user, team: team, username: "alice")
      group = insert(:group, team: team)
      group_bob = insert(:group_user, user: bob, group: group)
      group_alice = insert(:group_user, user: alice, group: group)

      {:ok, %{message: _message}} = Stitch.Message.create(group.id, bob, %{"text_content" => "Hello, <@U#{alice.id}>.", "type" => "chat"})

      group_bob = Repo.get(GroupUser, group_bob.id)
      group_alice = Repo.get(GroupUser, group_alice.id)

      assert group_bob.mentions_count == 0
      assert group_alice.mentions_count == 1
    end

    test "when two users are mentioned" do
      team = insert(:team)
      bob = insert(:user, username: "bob", team: team)
      alice = insert(:user, username: "alice", team: team)
      eve = insert(:user, username: "eve", team: team)
      group = insert(:group, slug: "general", team: team)
      group_bob = insert(:group_user, user: bob, group: group)
      group_alice = insert(:group_user, user: alice, group: group)
      _group_eve = insert(:group_user, user: eve, group: group)

      {:ok, %{message: _message}} = Stitch.Message.create(group.id, eve, %{"text_content" => "Hello, <@U#{alice.id}>, and <@U#{bob.id}>.", "type" => "chat"})

      group_bob = Repo.get(GroupUser, group_bob.id)
      group_alice = Repo.get(GroupUser, group_alice.id)

      assert group_bob.mentions_count == 1
      assert group_alice.mentions_count == 1

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

      {:ok, %{message: _message}} = Stitch.Message.create(group.id, eve, %{"text_content" => "Hi, @all!", "type" => "chat"})

      group_bob = Repo.get(GroupUser, group_bob.id)
      group_alice = Repo.get(GroupUser, group_alice.id)
      group_eve = Repo.get(GroupUser, group_eve.id)

      assert group_bob.mentions_count == 1
      assert group_alice.mentions_count == 1
      assert group_eve.mentions_count == 0

      assert available_groups_indexed_by_slug(bob)["general"].mentions_count == 1
      assert available_groups_indexed_by_slug(alice)["general"].mentions_count == 1
      assert available_groups_indexed_by_slug(eve)["general"].mentions_count == 0
    end
  end

  test "Message.delete/1 should decrement the corresponding group_user counters" do
    team = insert(:team)
    bob = insert(:user, username: "bob", team: team)
    alice = insert(:user, username: "alice", team: team)
    _eve = insert(:user, username: "eve", team: team)
    group = insert(:group, slug: "general", team: team)
    group_bob = insert(:group_user, user: bob, group: group)
    group_alice = insert(:group_user, user: alice, group: group)

    {:ok, %{message: message}} = Stitch.Message.create(group.id, bob, %{"text_content" => "Hello, <@U#{alice.id}>.", "type" => "chat"})

    group_bob = Repo.get(GroupUser, group_bob.id)
    group_alice = Repo.get(GroupUser, group_alice.id)

    assert group_bob.mentions_count == 0
    assert group_alice.mentions_count == 1

    {:ok, _message} = Stitch.Message.delete(message)

    group_bob = Repo.get(GroupUser, group_bob.id)
    group_alice = Repo.get(GroupUser, group_alice.id)

    assert group_bob.mentions_count == 0
    assert group_alice.mentions_count == 0
  end

  defp available_groups_indexed_by_slug(user) do
    user
    |> Stitch.GroupQueries.available_groups
    |> Enum.reduce(%{}, &Map.put(&2, &1.slug, &1))
  end
end
