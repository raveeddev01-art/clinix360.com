defmodule Stitch.Tokbox.Client do
  @moduledoc """
  This Module is a middle layer between Tokbox SDK and
  stitch project. Project is going to invoke functions
  from this Tokbox Client to finally reach Tokbox API.
  """

  def session_create, do: Tokbox.session_create()

  def token_generate(session_id, user_id) do
    opts = [connection_data: ~s({"user_id":#{user_id}})]
    user_token = Tokbox.generate_token(session_id, opts)
    {:ok, user_token}
  end
end
