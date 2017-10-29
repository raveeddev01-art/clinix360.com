defmodule StitchConnect.Web.Api.V1.ChangesetView do
  use StitchConnect.Web, :view

  def translate_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, &translate_error/1)
  end

  def reduced_message(errors) do
    Enum.map_join errors, ", and ", fn {field, errors} ->
      "#{field} #{Enum.join(errors, " and ")}"
    end
  end

  def render("error.json", %{changeset: changeset}) do
    errors = translate_errors(changeset)
    %{errors: errors, message: reduced_message(errors)}
  end
end
