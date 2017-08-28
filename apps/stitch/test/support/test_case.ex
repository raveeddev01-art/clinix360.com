defmodule Stitch.TestCase do
  use ExUnit.CaseTemplate

  using do
    quote do
      use ExUnit.Case
      import Stitch.Factory
    end
  end

  setup tags do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)

    unless tags[:async] do
      Ecto.Adapters.SQL.Sandbox.mode(Stitch.Repo, {:shared, self()})
    end

    :ok
  end
end
