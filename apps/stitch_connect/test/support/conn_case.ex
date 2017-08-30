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


  setup tags do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
    unless tags[:async] do
      Ecto.Adapters.SQL.Sandbox.mode(Stitch.Repo, {:shared, self()})
    end
    {:ok, conn: Phoenix.ConnTest.build_conn()}
  end

end
