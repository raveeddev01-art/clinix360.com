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

  test "Stitch.Message.get_mentions/2" do
    mentions = Stitch.Message.Mention.message_mentions("Hello, @bob", %{"@bob" => [1, 2]})
    assert mentions == [1, 2]
  end
end
