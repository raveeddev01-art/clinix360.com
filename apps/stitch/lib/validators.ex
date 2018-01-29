defmodule Stitch.Validators do
  import Ecto.Changeset
  import Stitch.Blacklist

  def validate_email_domain(changeset, field, opts \\ []) do
    validate_change(changeset, field, fn _, email ->
      host =
        email
        |> String.split("@")
        |> List.last()
        |> String.downcase()

      case host in blacklisted_email_domains() do
        true ->
          message = opts[:message] || "host %{host} is not supported"
          [{field, {message, [host: host]}}]

        false ->
          []
      end
    end)
  end

  def validate_no_emojis(changeset, field, opts \\ []) do
    validate_change(changeset, field, fn _, value ->
      emoji_count = Exmoji.Scanner.scan(value) |> length()

      case emoji_count > 0 do
        true -> [{field, opts[:message] || "should not have emojis."}]
        false -> []
      end
    end)
  end
end
