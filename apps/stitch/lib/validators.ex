defmodule Stitch.Validators do
  import Ecto.Changeset
  import Stitch.Blacklist
  alias Stitch.Countries

  def validate_email_domain(changeset, field, options \\ []) do
    validate_change(changeset, field, fn _, email ->
      invalid_email =
        Enum.any?(blacklisted_email_domains, fn(domain) ->
          String.contains?(email, domain)
        end)

      case invalid_email do
        true -> [{field, options[:message] || "email host is not supported"}]
        false -> []
      end
    end)
  end

  def validate_no_emojis(changeset, field, options \\ []) do
    validate_change(changeset, field, fn _, value ->
      emoji_count = Exmoji.Scanner.scan(value) |> length()

      case emoji_count > 0 do
        true -> [{field, options[:message] || "should not have emojis."}]
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
