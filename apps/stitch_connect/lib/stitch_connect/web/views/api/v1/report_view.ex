defmodule StitchConnect.Web.Api.V1.ReportView do
  use StitchConnect.Web, :view

  def render("show.json", %{report: report}), do: %{data: report(report)}

  defp report(report) do
    %{
      type: report.type,
      time_period: report.time_period,
      body: report.body,
    }
  end

end
