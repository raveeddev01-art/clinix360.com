defmodule Stitch.Web.Api.V1.HistoryCache do
  use Stitch.Web, :controller
  alias Stitch.HistoryCache

  import Stitch.UserAuthorization, only: [can_update_user?: 2]

  action_fallback(Stitch.Web.Api.V1.FallbackController)

  def index(conn, %{"user_id" => user_id}) do
    history = HistoryCache.get(user_id)

    render(conn, "index.json", history: history)
  end


  def save(conn, %{"user_id" => user_id, "history" => history}) do
    save_history = HistoryCache.set(user_id, history)
    conn
    |> json(%{save_history: save_history})
  end


  def delete(conn, %{"user_id" => user_id}) do
    del_history = HistoryCache.delete(user_id)
    conn
    |> json(%{del_history: del_history})
  end

end
