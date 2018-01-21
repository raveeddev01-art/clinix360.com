defmodule Stitch.FeatureGateway do
  @moduledoc """
  Defines which features are allowed based on a team's subscription.
  """
  alias Stitch.Billing.Subscription

  # Uncomment tier after first use
  # @basic ~w(BASIC PREMIUM POWER)
  @premium ~w(PREMIUM POWER)
  # @power ~w(POWER)

  @type expired_error :: :trial_expired | :subscription_expired
  @type insufficient_tier_error :: {:insufficient_tier, [valid_tier :: String.t()]}

  @doc """
  Checks if a feature is allowed for a given subscription.
  ## Examples
      iex> allowed?(:guests, %Subscription{tier: "POWER"})
      :ok
      iex> allowed?(:guests, %Subscription{tier: "BASIC"})
      {:error, {:insufficient_tier, ["PREMIUM", "POWER"]}}
  """
  @spec allowed?(atom, Subscription.t()) ::
          :ok | {:error, expired_error | insufficient_tier_error}
  # Handle subscriptions that are in a trial
  def allowed?(_feature, %Subscription{tier: "TRIAL", valid_until: valid_until}) do
    if DateTime.compare(valid_until, DateTime.utc_now()) == :gt do
      :ok
    else
      {:error, :trial_expired}
    end
  end

  # Handle subscriptions that have expired
  def allowed?(_feature, %Subscription{subscription_id: nil, subscription_line_item_id: nil}) do
    {:error, :subscription_expired}
  end

  # =======================================================
  #
  # BEGIN SUBSCRIPTION FEATURES
  #
  # =======================================================

  def allowed?(:guests, subscription), do: in_tier(subscription, @premium)

  # =======================================================
  #
  # END SUBSCRIPTION FEATURES
  #
  # =======================================================

  # Catch-all
  def allowed?(_feature, _subscription), do: :ok

  defp in_tier(%Subscription{tier: tier}, tiers) when is_list(tiers) do
    if tier in tiers do
      :ok
    else
      {:error, {:insufficient_tier, tiers}}
    end
  end
end
