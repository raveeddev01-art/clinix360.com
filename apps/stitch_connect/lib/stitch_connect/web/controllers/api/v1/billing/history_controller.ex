defmodule StitchConnect.Web.Api.V1.Billing.HistoryController do
  use StitchConnect.Web, :controller
  alias Stitch.Billing

  action_fallback StitchConnect.Web.Api.FallbackController

  def index(conn, _params) do
    team = conn.assigns.team
    history = Billing.list_payment_history(team)
    render(conn, "index.json", history: history)
  end
end
