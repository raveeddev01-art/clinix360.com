defmodule Stitch.Web.Api.V1.Billing.HistoryController do
  use Stitch.Web, :controller
  alias Stitch.Billing

  action_fallback(Stitch.Web.Api.FallbackController)

  def index(conn, _params) do
    team = conn.assigns.team
    history = Billing.list_payment_history(team)
    render(conn, "index.json", history: history)
  end
end
