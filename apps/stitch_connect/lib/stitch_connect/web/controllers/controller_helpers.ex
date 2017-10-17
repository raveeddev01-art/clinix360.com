defmodule StitchConnect.Web.ControllerHelpers do
  alias StitchConnect.Web.ErrorHelpers
  import Plug.Conn

  @doc """
  Logs a user in.
  """
  def login_user(conn, user) do
    conn
    |> put_session(:current_user, user)
    |> put_session(:authentication_token, user.token)
    |> put_session(:session_id, Stitch.Rand.token(12))
    |> put_session(:locked, false)
    |> configure_session(renew: true)
  end

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

  @doc """
  Parses through API request params for valid pagination values.

  The only supported pagination params are `:limit` and `:skip`.

  ## Examples

      iex> parse_pagination_params(%{"limit" => 5, "skip" => 5}, [:limit, :skip])
      [limit: 5, skip: 5]

      iex> parse_pagination_params(%{"limit" => "10", "skip" => "10"}, [:limit, :skip])
      [limit: 10, skip: 10]

      iex> parse_pagination_params(%{}, [:limit, :skip])
      []

      iex> parse_pagination_params(%{"limit" => "bad", "skip" => "10"}, [:limit, :skip])
      [skip: 10]
  """
  @type pagination_param :: :limit | :skip
  @spec parse_pagination_params(%{}, [pagination_param]) :: [{pagination_param, integer}]
  def parse_pagination_params(params, pagination_params) when is_list(pagination_params) do
    pagination_params
    |> Enum.filter(&(&1 in [:limit, :skip]))
    |> Enum.uniq()
    |> Enum.flat_map(&do_parse_pagination_param(&1, params))
  end

  defp do_parse_pagination_param(key, params) when key in [:limit, :skip] do
    param_key = Atom.to_string(key)
    case ensure_integer(params[param_key]) do
      nil -> []
      value -> [{key, value}]
    end
  end

  defp ensure_integer(value) when is_integer(value), do: value
  defp ensure_integer(value) when is_binary(value) do
    try do
      String.to_integer(value)
    rescue
      ArgumentError -> nil
    end
  end
  defp ensure_integer(_), do: nil
end
