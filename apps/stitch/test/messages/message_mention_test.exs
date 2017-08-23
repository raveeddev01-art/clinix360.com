defmodule Stitch.Message.MentionTest do
  use ExUnit.Case, async: true
  import Stitch.Factory

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
  end
end
