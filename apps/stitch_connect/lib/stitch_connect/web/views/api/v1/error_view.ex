defmodule StitchConnect.Web.Api.V1.ErrorView do
  defmacro __using__(_) do
    quote do
      def render("error.json", %{reason: reason}) do
        reason = cond do
          is_nil(reason) || reason == "" -> "Unknown error."
          is_bitstring(reason) -> reason
          true -> StitchConnect.Web.ErrorHelpers.error_string_from_changeset(reason)
        end

        %{error: reason}
      end
    end
  end
end
