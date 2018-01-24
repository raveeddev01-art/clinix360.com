defmodule StitchConnect.Web.Api.V1.Billing.HistoryView do
  use StitchConnect.Web, :view

  def render("index.json", %{history: histories}) do
    data = for history <- histories, do: history_json(history)
    %{data: data}
  end

  defp history_json(history) do
    %{
      id: history.id,
      plan: history.plan,
      amount: history.amount,
      quantity: history.quantity,
      period_end: history.period_end,
      inserted_at: history.inserted_at,
      period_start: history.period_start
    }
  end
end
