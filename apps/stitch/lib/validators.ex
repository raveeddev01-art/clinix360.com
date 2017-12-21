defmodule Stitch.Validators do
  import Ecto.Changeset
  import Stitch.Blacklist

  def validate_email_domain(changeset, field, options \\ []) do
    validate_change(changeset, field, fn _, email ->
      valid_email =
        Enum.any?(blacklisted_email_domains, fn(domain) ->
          !String.contains?(email, domain)
        end)

      case valid_email do
        true -> []
        false -> [{field, options[:message] || "email host is not supported"}]
      end
    end)
  end
end