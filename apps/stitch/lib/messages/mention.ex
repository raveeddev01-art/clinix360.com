defmodule Stitch.Message.Mention do
  @doc """
  Takes a list of users and a mesage and returns which out of those users should be notified
  by this message.
  """
  def get_mentioned_user_ids(_users, _author, nil, _active_user_ids, _group_user_ids, _is_default), do: []
  def get_mentioned_user_ids(users, author, message, active_user_ids, group_user_ids, is_default) do
    mention_user_keywords = user_mention_keywords(users, author, active_user_ids, group_user_ids, is_default)
    message_mentions(message, mention_user_keywords)
  end

  @doc """
  Initially, use user nicknames.
  Expand later to add other keywords user might wish to be notified of, depending on user group preferences.
  Note, in some case, user might want to disable certain notifications (globally or only for a specific group).
  Excludes authors.

  Example of keywords:
    - @here, @all, @everyone
    - @group,
    - username
    - user's first/last/full name, depending on notificaiton preferences
    - user's custom keywords for this group


      Stitch.Mention.user_mention_keywords([
        %{id: 1, username: "bob"},
        %{id: 2, username: "alice"}
      ], %{username: "bob"})

      %{
        "@bob" => [],
        "@alice" => [2],
        "@all" => [1, 2]
      }
  """
  def user_mention_keywords(users, author, active_user_ids, %Stitch.Group{} = group) do
    mentions =
      users
      |> Enum.reduce(%{}, fn (user, acc) ->
        if user.username == author.username do
          acc
        else
          Map.put(acc, "<@U#{user.id}>", [user.id])
        end
      end)

    mentions =
      if group.name == "__dm_group__" or group.name == "__multi_dm_group__" do
        mentions
      else
        mentions
        |> Map.put("<@Ghere>", active_user_ids |> List.delete(author.id))
        |> Map.put("<@Groom>", users |> Enum.map(& &1.id) |> List.delete(author.id))
      end

    if group.is_default do
      mentions |> Map.put("<@Geveryone>", group_user_ids |> List.delete(author.id))
    else
      mentions
    end
  end

  @doc """
  Return ids of users whose mention keywords are present in the message. (handles duplicates)

      Stitch.Mention.message_mentions("Hello, @username!", %{"@username" => [1, 2, 3], "my_custom_keyword" => [2, 3, 4, 5]})
      [1, 2, 3, 4, 5]
  """
  def message_mentions(message, mention_keywords) do
    word_splitter = cached_word_splitter()
    String.split(message, cached_splitter())
    |> Enum.reduce(%{}, fn (word, acc) ->
      case Map.fetch(mention_keywords, word) do
        {:ok, user_ids} -> check_user_ids(user_ids, acc)
        :error ->
          case String.split(word, word_splitter) do
            [_word] -> acc
            list ->
              Enum.reduce(list, acc, fn (word, acc) ->
                case Map.fetch(mention_keywords, word) do
                  {:ok, user_ids} -> check_user_ids(user_ids, acc)
                  :error -> acc
                end
              end)
          end
      end
    end)
    |> Map.keys
  end

  defp check_user_ids(user_ids, acc) do
    Enum.reduce(user_ids, acc, fn (user_id, sub_acc) ->
      Map.put(sub_acc, user_id, true)
    end)
  end

  defp cached_splitter do
    case Application.fetch_env(:stitch, :mention_splitter) do
      {:ok, splitter} -> splitter
      :error ->
        pattern = split_pattern()
        :ok = Application.put_env(:stitch, :mention_splitter, pattern)
        pattern
    end
  end

  def cached_word_splitter do
    case Application.fetch_env(:stitch, :word_splitter) do
      {:ok, splitter} -> splitter
      :error ->
        word_splitter = :binary.compile_pattern([".", "-"])
        :ok = Application.put_env(:stitch, :word_splitter, word_splitter)
        word_splitter
    end
  end

  # From https://hexdocs.pm/elixir/String.html#module-patterns,
  # > Note though the compiled pattern cannot be stored in a module
  # > attribute as the pattern is generated at runtime and does not survive compile term.
  #
  defp split_pattern do
    :binary.compile_pattern([
      " ",
      "!",
      "\"",
      "#",
      "$",
      "%",
      "&",
      "'",
      "(",
      ")",
      "*",
      "+",
      ",",
      # "-",
      # ".",
      "/",
      ":",
      ";",
      # "<",
      "=",
      # ">",
      "?",
      "[",
      "\\",
      "]",
      "^",
      "_",
      "`",
      "{",
      "|",
      "}",
      "~",
    ])
  end
end
