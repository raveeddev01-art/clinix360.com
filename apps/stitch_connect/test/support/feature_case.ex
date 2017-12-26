defmodule StitchConnect.Web.FeatureCase do
  @moduledoc """
  Template for creating integration tests.

  ## Concurrent Tests

  When writing integration tests to be concurrent, there is metadata about the Ecto connection
  that the test needs to be aware of to pass to the broweser. The metadata needs to be sent to Wallaby when calling
  `Wallaby.start_sesion/1`.

  ### Example Metadata Usage.

  ```
  test "some feature", %{metadata: metadata} do
    # User and team setup...

    # Apply the metadata to the brower session for normal interactions over Plug
    {:ok, session} = Wallaby.start_session(metadata: metadata)

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
    context = %{metadata: metadata}

    context =
      if tags[:start_session] do
        {:ok, session} = Wallaby.start_session(metadata: metadata)
        Wallaby.Browser.resize_window(session, 1400, 1000)
        Map.put(context, :session, session)
      else
        context
      end

    {:ok, context}
  end
end
