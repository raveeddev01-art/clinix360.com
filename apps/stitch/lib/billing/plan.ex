defmodule Stitch.Billing.Plan do
  @doc """
  Returns plan id based on renewal frequency and tier
  """
  def id(%{tier: "BASIC", renewal_frequency: "MONTHLY"}), do: "basic_monthly"
  def id(%{tier: "BASIC", renewal_frequency: "YEARLY"}), do: "basic_yearly"
  def id(%{tier: "PREMIUM", renewal_frequency: "MONTHLY"}), do: "premium_monthly"
  def id(%{tier: "PREMIUM", renewal_frequency: "YEARLY"}), do: "premium_yearly"
  def id(%{tier: "POWER", renewal_frequency: "MONTHLY"}), do: "power_monthly"
  def id(%{tier: "POWER", renewal_frequency: "YEARLY"}), do: "power_yearly"
  def id(%{tier: tier, renewal_frequency: duration}), do: "#{tier}_#{duration}"

  @doc """
  Returns a user-friendly plan name.
  """
  def display_name("TRIAL"), do: "Trial"
  def display_name("BASIC"), do: "Basic"
  def display_name("PREMIUM"), do: "Premium"
  def display_name("POWER"), do: "Power"
end