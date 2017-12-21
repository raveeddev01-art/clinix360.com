defmodule Stitch.Validators do
  import Ecto.Changeset
  import Stitch.Blacklist

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
end