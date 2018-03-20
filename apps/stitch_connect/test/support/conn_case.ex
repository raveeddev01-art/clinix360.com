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
  alias StitchConnect.Web.Endpoint

  using do
    quote do
      # Import conveniences for testing with connections
      use Phoenix.ConnTest
      import StitchConnect.Web.ChannelsTestHelper
      import StitchConnect.Web.Router.Helpers
      import Stitch.Factory
      import StitchConnect.Web.ConnCase, only: [with_session: 1, with_user_session: 2, with_team_subdomain: 2, with_api_user: 2, with_admin_subdomain: 1]

      # The default endpoint for testing
      @endpoint StitchConnect.Web.Endpoint

      def subdomain(conn, subdomain) do
        %{ conn | host: "#{subdomain}.#{Endpoint.host}" }
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
  Adds a session with no user
  """
  @spec with_session(Plug.Conn.t) :: Plug.Conn.t
  def with_session(conn) do
    Plug.Test.init_test_session(conn, %{})
  end

  @doc """
  Assigns the user to the sesion storage for the connection
  """
  @spec with_user_session(Plug.Conn.t, Stitch.Accounts.User.t) :: Plug.Conn.t
  def with_user_session(conn, %Stitch.Accounts.User{} = user) do
    Plug.Test.init_test_session(conn, %{current_user_token: user.token})
  end

  @doc """
  Mimics a connection being routed through a team's subdomain.
  """
  @spec with_team_subdomain(Plug.Conn.t, Stitch.Team.t) :: Plug.Conn.t
  def with_team_subdomain(conn, %Stitch.Team{slug: team_slug}) do
    %Plug.Conn{conn | host: "#{team_slug}.#{Endpoint.host}"}
  end

  @doc """
  Mimics a connection being routed to admin subdomain.
  """
  @spec with_admin_subdomain(Plug.Conn.t) :: Plug.Conn.t
  def with_admin_subdomain(conn) do
    %Plug.Conn{conn | host: "admin.#{Endpoint.host}"}
  end

  @doc """
  Mimics a request being made by a user via the API.

  When calling this function, any existing query params on the conn will be overwritten.
  """
  @spec with_api_user(Plug.Conn.t, Stitch.Accounts.User.t) :: Plug.Conn.t
  def with_api_user(conn, %Stitch.Accounts.User{token: token}) do
    %Plug.Conn{conn | query_params: %{"authenticationToken" => token}}
  end

  setup tags do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
    unless tags[:async] do
      Ecto.Adapters.SQL.Sandbox.mode(Stitch.Repo, {:shared, self()})
    end
    {:ok, conn: Phoenix.ConnTest.build_conn(:get, Endpoint.url <> "/", nil)}
  end

end
