defmodule Stitch.StarrableItems.StarringServiceTest do
  use ExUnit.Case, async: true
  import Stitch.Factory
  alias Stitch.StarrableItems.StarringService

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.StarringService.toggle_star/2" do
    test "returns true if message has been starred" do
      message = insert(:message)
      assert {true, {:ok, _message_action}} = StarringService.toggle_star(message, message.user)
      refute StarringService.get_star(message, message.user) == nil
    end

    test "returns false if message has been unstarred" do
      message = insert(:message)
      assert {true, {:ok, _message_action}} = StarringService.toggle_star(message, message.user)
      assert {false, {:ok, _message_action}} = StarringService.toggle_star(message, message.user)
      assert StarringService.get_star(message, message.user) == nil
    end
  end
end
