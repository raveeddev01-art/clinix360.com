defmodule StitchConnect.Web.FeatureCase do
  use ExUnit.CaseTemplate

  using do
    quote do
      use Wallaby.DSL

      alias Stitch.Repo
      import Ecto
      import Ecto.Changeset
      import Ecto.Query

      import StitchConnect.Web.Router.Helpers
    end
  end

  setup tags do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)

    unless tags[:async] do
      Ecto.Adapters.SQL.Sandbox.mode(Stitch.Repo, {:shared, self()})
    end

    metadata = Phoenix.Ecto.SQL.Sandbox.metadata_for(Stitch.Repo, self())
    {:ok, session} = Wallaby.start_session(metadata: metadata)
    session = Wallaby.Browser.resize_window(session, 1400, 1000)
    {:ok, session: session}
  end
end
