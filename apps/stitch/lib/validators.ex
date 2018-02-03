defmodule Stitch.Validators do
  import Ecto.Changeset
  import Stitch.Blacklist
  alias Stitch.Countries

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

  def validate_country_iso_alpha(changeset, field, options \\ []) do
    validate_change(changeset, field, fn _, value ->
      countries = Countries.by_iso_alpha_three()

      case countries[value] do
        nil -> [{field, options[:message] || "is invalid."}]
        _ -> []
      end
    end)
  end
end
