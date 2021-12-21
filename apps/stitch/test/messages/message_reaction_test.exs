defmodule Stitch.MessageReactionTest do
  use Stitch.DataCase, async: true
  alias Stitch.Message.Reaction
  alias Stitch.Message

  describe "Stitch.MessageReaction.apply_reactions/2" do
    test "adds reactions to message list" do
      user = insert(:user)
      message_a = insert(:message, reactions: %{user.id => ["penguin"]})
      message_b = insert(:message, reactions: %{user.id => ["dragon"]})

      [a_with_reactions, b_with_reactions] =
        Reaction.apply_reactions([message_a, message_b], :message)

      assert a_with_reactions.reactions["penguin"] == [user.id]
      assert a_with_reactions.reactions["dragon"] == nil
      assert b_with_reactions.reactions["penguin"] == nil
      assert b_with_reactions.reactions["dragon"] == [user.id]
    end
  end

  describe "Stitch.MessageReaction.toggle_reaction/3" do
    setup do
      {:ok, user: insert(:user)}
    end

    test "toggles a reaction on for message", %{user: user} do
      message = insert(:message)
      Reaction.toggle_reaction(message, user, "sunrise_over_mountains")

      assert Repo.get(Message, message.id).reactions[user.id |> Integer.to_string()] == [
               "sunrise_over_mountains"
             ]
    end

    test "toggles a reaction off for message", %{user: user} do
      message = insert(:message)
      Reaction.toggle_reaction(message, user, "sunrise_over_mountains")
      Reaction.toggle_reaction(message, user, "sunrise_over_mountains")
      assert Repo.get(Message, message.id).reactions[user.id] == nil
    end
  end
end
