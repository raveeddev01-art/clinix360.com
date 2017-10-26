defmodule StitchConnect.Web.Api.V1.Billing.SubscriptionView do
  use StitchConnect.Web, :view

  def render("show.json", %{subscription: subscription}) do
    %{
      data: subscription(subscription)
    }
  end

  defp subscription(subscription) do
    %{
      tier: subscription.tier,
      valid_until: subscription.valid_until,
      renewal_frequency: subscription.renewal_frequency,
      renews: subscription.renews,
      estimated_invoice_amount: subscription.estimated_invoice_amount,
      updated_at: subscription.updated_at
    }
  end
end
