defmodule Stitch.Stripe.TestClient do
  @moduledoc """
  Mock Stripe client meant for testing purposes.
  """

  @behaviour Stitch.Stripe

  def create_customer(_team_id, _team_name) do
    "cus_#{timestamp()}"
  end

  def delete_customer(_customer_id), do: true

  defp timestamp do
    DateTime.to_unix(DateTime.utc_now())
  end
end
