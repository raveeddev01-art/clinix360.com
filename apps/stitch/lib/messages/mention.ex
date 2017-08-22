defmodule Stitch.Message.Mention do
  @doc """
  Initially, use user nicknames.
  Expand later to add other keywords user might wish to be notified of, depending on user group preferences.
  Note, in some case, user might want to disable certain notifications (globally or only for a specific group).

  Example of keywords:
    - @here, @all, @everyone
    - @group,
    - username
    - user's first/last/full name, depending on notificaiton preferences
    - user's custom keywords for this group


      Stitch.Mention.user_mention_keywords([
        %{id: 1, username: "bob"},
        %{id: 2, username: "alice"}
      ])

      %{
        "@bob" => [1],
        "@alice" => [2],
        "@all" => [1, 2]
      }
  """
  def user_mention_keywords(users) do
    mentions = Enum.reduce(users, %{}, fn (user, acc) ->
      Map.put(acc, "@#{user.username}", [user.id])
    end)
    Map.put(mentions, "@all", Enum.map(users, & &1.id))
  end

  @doc """
  Return ids of users whose mention keywords are present in the message. (handles duplicates)

      Stitch.Mention.message_mentions("Hello, @username!", %{"@username" => [1, 2, 3], "my_custom_keyword" => [2, 3, 4, 5]})
      [1, 2, 3, 4, 5]
  """
  def message_mentions(message, mention_keywords) do
    String.split(message)
    |> Enum.reduce(%{}, fn (word, acc) ->
      case Map.fetch(mention_keywords, word) do
        {:ok, user_ids} ->
          Enum.reduce(user_ids, acc, fn (user_id, sub_acc) ->
            Map.put(sub_acc, user_id, true)
          end)
        :error ->
          acc
      end
    end)
    |> Map.keys
  end
end
