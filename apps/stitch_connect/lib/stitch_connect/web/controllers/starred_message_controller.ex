defmodule StitchConnect.Web.Api.V1.StarredMessageController do
  use StitchConnect.Web, :controller
  alias Stitch.MessageQueries

  def index(conn, params) do
    opts =
      params
      |> Map.take(["limit", "skip"])
      |> Enum.map(fn {key, value} ->
        value = case value do
          value when is_binary(value) -> String.to_integer(value)
          value when is_integer(value) -> value
        end

        {:"#{key}", value}
      end)
      |> Keyword.update(:limit, 30, fn limit -> Enum.min([limit, 30]) end)

    starred_messages = MessageQueries.user_starred_messages(conn.assigns.current_user.id, opts)
    render conn, "index.json", starred_messages: starred_messages
  end
end
