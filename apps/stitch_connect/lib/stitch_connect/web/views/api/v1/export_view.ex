defmodule StitchConnect.Web.Api.V1.ExportView do
  use StitchConnect.Web, :view

  def render("index.json", %{exports: exports}) do
    data = for export <- exports, do: export(export)
    %{data: data}
  end

  def render("show.json", %{export: export}), do: %{data: export(export)}

  def render("429.json", _) do
    %{error: "Only one export request allowed per 24 hour period."}
  end

  defp export(export) do
    %{
      id: export.id,
      status: export.status,
      inserted_at: export.inserted_at,
      updated_at: export.updated_at
    }
  end

end
