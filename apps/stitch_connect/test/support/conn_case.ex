defmodule StitchConnect.Web.ConnCase do
  @moduledoc """
  This module defines the test case to be used by
  tests that require setting up a connection.

  Such tests rely on `Phoenix.ConnTest` and also
  import other functionality to make it easier
  to build common datastructures and query the data layer.

  Finally, if the test case interacts with the database,
  it cannot be async. For this reason, every test runs
  inside a transaction which is reset at the beginning
  of the test unless the test case is marked as async.
  """

  use ExUnit.CaseTemplate

  using do
    quote do
      # Import conveniences for testing with connections
      use Phoenix.ConnTest
      import StitchConnect.Web.ChannelsTestHelper
      import StitchConnect.Web.Router.Helpers
      import Stitch.Factory
      import StitchConnect.Web.ConnCase, only: [with_user_session: 2, with_team_subdomain: 2]

      # The default endpoint for testing
      @endpoint StitchConnect.Web.Endpoint

      def subdomain(conn, subdomain) do
        %{ conn | host: "#{subdomain}.localhost" }
      end

      def get_as_user(conn, user, url, params \\ %{}) do
        get(conn, "#{url}?authenticationToken=#{user.token}", params)
      end

      def post_as_user(conn, user, url, params \\ %{}) do
        post(conn, "#{url}?authenticationToken=#{user.token}", params)
      end

      def put_as_user(conn, user, url, params \\ %{}) do
        put(conn, "#{url}?authenticationToken=#{user.token}", params)
      end

      def delete_as_user(conn, user, url, params \\ %{}) do
        delete(conn, "#{url}?authenticationToken=#{user.token}", params)
      end
    end
  end

  @doc """
  Assigns the user to the sesion storage for the connection
  """
  @spec with_user_session(Plug.Conn.t, Stitch.Accounts.User.t) :: Plug.Conn.t
  def with_user_session(conn, %Stitch.Accounts.User{} = user) do
    session_opts = Plug.Session.init(store: :cookie, key: "_stitch_connect_key", signing_salt: "o9McnPJj")
    conn
    |> Plug.Session.call(session_opts)
    |> Plug.Conn.fetch_session()
    |> Plug.Conn.put_session(:current_user, user)
  end

  @doc """
  Mimics a connection being routed through a team's subdomain.
  """
  @spec with_team_subdomain(Plug.Conn.t, Stitch.Team.t) :: Plug.Conn.t
  def with_team_subdomain(conn, %Stitch.Team{slug: team_slug}) do
    %Plug.Conn{conn | host: "#{team_slug}.localhost"}
  end

  setup tags do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
    unless tags[:async] do
      Ecto.Adapters.SQL.Sandbox.mode(Stitch.Repo, {:shared, self()})
    end
    {:ok, conn: Phoenix.ConnTest.build_conn()}
  end

end
