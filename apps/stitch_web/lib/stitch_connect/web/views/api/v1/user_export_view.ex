defmodule StitchConnect.Web.Api.V1.UserExportView do
  use Stitch.Web, :view

  alias Stitch.Web.Api.V1.{
    UserView
  }

  def render("index.json", %{exports: exports}) do
    Enum.map(exports, &export/1)
  end

  def render("show.json", %{export: export}), do: %{data: export(export)}

  def render("429.json", _) do
    %{message: "Only one export request allowed per 24 hour period."}
  end

  defp export(export) do
    %{
      id: export.id,
      status: export.status,
      inserted_at: export.inserted_at,
      updated_at: export.updated_at
    }
    |> with_user(export.user)
  end

  def with_user(view, %Stitch.Accounts.User{} = user) do
    view
    |> Map.put(:user, UserView.user_json(user))
  end

  def with_user(view, _user), do: view
end
