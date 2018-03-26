defmodule Stitch.Billing.Plan do
  @doc """
  Returns plan id based on renewal frequency and tier
  """
  def id(%{tier: "FREE"}), do: "free"
  def id(%{tier: "STANDARD", renewal_frequency: "MONTHLY"}), do: "standard_monthly"
  def id(%{tier: "STANDARD", renewal_frequency: "YEARLY"}), do: "standard_yearly"
  def id(%{tier: "PREMIUM", renewal_frequency: "MONTHLY"}), do: "premium_monthly_v2"
  def id(%{tier: "PREMIUM", renewal_frequency: "YEARLY"}), do: "premium_yearly_v2"
  def id(%{tier: tier, renewal_frequency: duration}), do: "#{tier}_#{duration}"

  @doc """
  Returns a user-friendly plan name.
  """
  def display_name("FREE"), do: "Free"
  def display_name("STANDARD"), do: "Standard"
  def display_name("PREMIUM"), do: "Premium"
end
