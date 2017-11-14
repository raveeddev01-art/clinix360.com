defmodule StitchConnect.Web.Api.V1.ReportController do
  use StitchConnect.Web, :controller
  alias Stitch.Reports

  action_fallback StitchConnect.Web.Api.FallbackController

  def create(conn, %{"type" => type, "time_period" => time_period}) do
    team = conn.assigns.team
    with :ok    <- validate_type(type),
         :ok    <- validate_time_period(time_period),
         opts   <- prepare_opts(type, time_period),
         report <- Reports.create(team, opts) do
      conn
      |> put_status(:created)
      |> render("show.json", report: report)
    else
      :error -> {:error, :not_found}
      error -> error
    end
  end

  defp prepare_opts(type, time_period) do
    %{type: parameterize(type), time_period: parameterize(time_period)}
  end

  defp parameterize(subject) do
    subject |> String.downcase() |> String.replace(" ", "_") |> String.to_atom()
  end

  defp validate_type(type) do
    if type in ["Messages Sent", "Files Uploaded"], do: :ok, else: :error
  end

  defp validate_time_period(time_period) do
    if time_period in ["last 7 days", "last 30 days", "all time"], do: :ok, else: :error
  end
end
