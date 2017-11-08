defmodule Stitch.RandTest do
  use ExUnit.Case, async: true

  test "Stitch.Rand.token/1" do
    Enum.each 8..32, fn n ->
      assert Stitch.Rand.token(n) =~ ~r/[A-Za-z0-9_-]{#{n}}/
    end
  end
end
