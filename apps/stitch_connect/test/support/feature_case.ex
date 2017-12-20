defmodule StitchConnect.Web.FeatureCase do
  @moduledoc """
  Template for creating integration tests.

  ## Concurrent Tests

  When writing integration tests to be concurrent, there is metadata about the Ecto connection
  that the test needs to be aware of to pass to the broweser. The metadata needs to be sent to Wallaby when calling
  `Wallaby.start_sesion/1`. Additionally, whenever simulating a user login, there is encoded metadata
  that needs to be applied to the browser to use with Phoenix channels.

  ### Example Metadata Usage.

  ```
  test "some feature", %{metadata: metadata, encoded_metadata} do
    # User and team setup...

    # Apply the metadata to the brower session for normal interactions over Plug
    {:ok, session} = Wallaby.start_session(metadata: metadata)

    # Apply the encoded metadata to the brower session so channels can use the Ecto connection
    StitchConnect.Web.IntegrationTestHelper.sign_in(session, team, user, encoded_metadata)

    # Rest of the test
  end
  ```
  """
  use ExUnit.CaseTemplate

  @timeout :timer.minutes(5)
  using do
    quote do
      use Wallaby.DSL

      alias Stitch.Repo
      import Ecto
      import Ecto.Changeset
      import Ecto.Query

      import StitchConnect.Web.Router.Helpers
      import StitchConnect.Web.FeatureCase, only: [setup_async_session: 2]
      @moduletag timeout: unquote(@timeout)
      @moduletag integration: true
    end
  end

  setup tags do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo, ownership_timeout: @timeout)

    unless tags[:async] do
      Ecto.Adapters.SQL.Sandbox.mode(Stitch.Repo, {:shared, self()})
    end

    metadata = Phoenix.Ecto.SQL.Sandbox.metadata_for(Stitch.Repo, self())
    encoded_metadata =
      metadata
      |> :erlang.term_to_binary()
      |> Base.url_encode64()

    params = %{metadata: metadata, encoded_metadata: encoded_metadata}

    params =
      if tags[:start_session] do
        {:ok, session} = Wallaby.start_session(metadata: metadata)
        Wallaby.Browser.resize_window(session, 1400, 1000)
        Map.put(params, :session, session)
      else
        params
      end

    {:ok, params}
  end

  @doc """
  Configures a session to be run asynchronously by adding SQL Sandbox information.

  For this call to work, the session must have navigated to a URL prior.
  """
  def setup_async_session(session, encoded_metadata) do
    Wallaby.Browser.execute_script(session, "sessionStorage.setItem(\"owner\", \"#{encoded_metadata}\");")
  end
end
