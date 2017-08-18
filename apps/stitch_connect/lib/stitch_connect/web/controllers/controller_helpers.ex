defmodule StitchConnect.Web.ControllerHelpers do
  import Plug.Conn
  import Phoenix.Controller
  alias StitchConnect.Web.ErrorHelpers

  @doc """
  Takes a changeset with errors and parses it into a string

      #Ecto.Changeset<errors: [
        text_content: {"can't be blank", []},
        type: {"custom error", []},
        type: {"is not supported", []
      }],

      "Type is not supported. Type custom error. Text content can'tbe blank"
  """
  def changeset_errors_to_string(changeset) do
    Enum.map(changeset.errors, fn {field, detail} ->
      "#{Phoenix.Naming.humanize(field)} #{ErrorHelpers.translate_error(detail)}"
    end) |> Enum.join(". ")
  end

  @doc """
  Takes a changeset with errors and parses it into a map

      #Ecto.Changeset<errors: [
        text_content: {"can't be blank", []},
        type: {"custom error", []},
        type: {"is not supported", []
      }],

      %{
        "type" => [
          "is not supported",
          "custom error"
        ],
        "text_content" => [
          "can't be blank"
        ]
      }
  """
  def changeset_errors_to_map(changeset) do
    Enum.reduce(changeset.errors, %{}, fn ({field, detail}, acc) ->
      field_errors = Map.get(acc, field, [])
      field_errors = [ErrorHelpers.translate_error(detail) | field_errors]
      Map.put(acc, field, field_errors)
    end)
  end
end