defmodule Stitch.MessageReactionTest do
  use Stitch.DataCase, async: true
  alias Stitch.Message.Reaction

  describe "Stitch.MessageReaction.apply_reactions/2" do
    test "adds reactions to message list" do
      message_a = insert(:message)
      message_b = insert(:message)
      user = insert(:user)
      insert(:message_reaction, message: message_a, user: user, emoji_name: "penguin")
      insert(:message_reaction, message: message_b, user: user, emoji_name: "dragon")

      [a_with_reactions, b_with_reactions] =
        Reaction.apply_reactions([message_a, message_b], :message)

      assert a_with_reactions.reactions["penguin"] == [user.id]
      assert a_with_reactions.reactions["dragon"] == nil
      assert b_with_reactions.reactions["penguin"] == nil
      assert b_with_reactions.reactions["dragon"] == [user.id]
    end

    test "adds reactions to conversation_message list" do
      conversation_message_a = insert(:conversation_message)
      conversation_message_b = insert(:conversation_message)
      user = insert(:user)

      insert(
        :conversation_message_reaction,
        conversation_message: conversation_message_a,
        user: user,
        emoji_name: "feet"
      )

      insert(
        :conversation_message_reaction,
        conversation_message: conversation_message_b,
        user: user,
        emoji_name: "frog"
      )

      [a_with_reactions, b_with_reactions] =
        Reaction.apply_reactions(
          [conversation_message_a, conversation_message_b],
          :conversation_message
        )

      assert a_with_reactions.provider_reactions["feet"] == [user.id]
      assert a_with_reactions.provider_reactions["frog"] == nil
      assert b_with_reactions.provider_reactions["feet"] == nil
      assert b_with_reactions.provider_reactions["frog"] == [user.id]
    end
  end

  describe "Stitch.MessageReaction.toggle_reaction/3" do
    setup do
      {:ok, user: insert(:user)}
    end

    test "toggles a reaction on for message", %{user: user} do
      message = insert(:message)
      Reaction.toggle_reaction(message, user, "sunrise_over_mountains")

      assert Repo.get_by(
               Reaction,
               message_id: message.id,
               user_id: user.id,
               emoji_name: "sunrise_over_mountains"
             )
    end

    test "toggles a reaction off for message", %{user: user} do
      message = insert(:message)

      insert(
        :message_reaction,
        message: message,
        user: user,
        emoji_name: "sunrise_over_mountains"
      )

      Reaction.toggle_reaction(message, user, "sunrise_over_mountains")

      refute Repo.get_by(
               Reaction,
               message_id: message.id,
               user_id: user.id,
               emoji_name: "sunrise_over_mountains"
             )
    end

    test "toggles a reaction on for conversation_message", %{user: user} do
      conversation_message = insert(:conversation_message)
      Reaction.toggle_reaction(conversation_message, user, "full_moon_with_face")

      assert Repo.get_by(
               Reaction,
               conversation_message_id: conversation_message.id,
               user_id: user.id,
               emoji_name: "full_moon_with_face"
             )
    end

    test "toggles a reaction off for conversation_message", %{user: user} do
      conversation_message = insert(:conversation_message)

      insert(
        :conversation_message_reaction,
        conversation_message: conversation_message,
        user: user,
        emoji_name: "full_moon_with_face"
      )

      Reaction.toggle_reaction(conversation_message, user, "full_moon_with_face")

      refute Repo.get_by(
               Reaction,
               conversation_message_id: conversation_message.id,
               user_id: user.id,
               emoji_name: "full_moon_with_face"
             )
    end
  end
end
