defmodule Stitch.DataCase do
  @moduledoc """
  This module defines the setup for tests requiring
  access to the application's data layer.

  You may define functions here to be used as helpers in
  your tests.

  Finally, if the test case interacts with the database,
  it cannot be async. For this reason, every test runs
  inside a transaction which is reset at the beginning
  of the test unless the test case is marked as async.
  """

  use ExUnit.CaseTemplate

  using do
    quote do
      alias Stitch.Repo

      import Ecto
      import Ecto.Changeset
      import Ecto.Query
      import Stitch.DataCase
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

  @doc """
  A helper that transform changeset errors to a map of messages.

      assert {:error, changeset} = Accounts.create_user(%{password: "short"})
      assert "password is too short" in errors_on(changeset).password
      assert %{password: ["password is too short"]} = errors_on(changeset)

  """
  def errors_on(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {message, opts} ->
      Enum.reduce(opts, message, fn {key, value}, acc ->
        String.replace(acc, "%{#{key}}", to_string(value))
      end)
    end)
  end

  @doc """
  Helper to remove already set associations in a struct.

  This should only be used on structs that use Ecto and fields that use an association.

  ## Example

      iex> clear_assoc(%User{team: %Team{...}, ...}, :team)
      %User{team: %Ecto.Association.NotLoaded{...}, ...}

  """
  def clear_assoc(%mod{} = data, key) do
    default_value =
      mod
      |> struct()
      |> Map.get(key)
    Map.put(data, key, default_value)
  end
end
