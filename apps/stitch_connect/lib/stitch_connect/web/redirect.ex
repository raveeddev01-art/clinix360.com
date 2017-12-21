
defmodule Redirect do
  @refactor """
  Module should be namespaced by StitchConnect
  """

  @moduledoc """
  Redirects the conn to the provided url - both internal
  or external.

  ## Usage

  get "/", Redirect, to: "/some-other-url"
  get "/", Redirect, external: "https://google.com"
  """
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, opts) do
    conn
    |> Phoenix.Controller.redirect(opts)
    |> halt()
  end
end
