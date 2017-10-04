defmodule StitchConnect.Web.ControllerHelpersTest do
  use ExUnit.Case, async: true
  doctest StitchConnect.Web.ControllerHelpers, import: true
  import StitchConnect.Web.ControllerHelpers

  describe "parse_pagination_params/2" do
    test "parses for :limit" do
      assert parse_pagination_params(%{"limit" => 2}, [:limit]) == [limit: 2]
      assert parse_pagination_params(%{"limit" => "2"}, [:limit]) == [limit: 2]
      assert parse_pagination_params(%{"limit" => "bad_value"}, [:limit]) == []
    end

    test "parses for :skip" do
      assert parse_pagination_params(%{"skip" => 2}, [:skip]) == [skip: 2]
      assert parse_pagination_params(%{"skip" => "2"}, [:skip]) == [skip: 2]
      assert parse_pagination_params(%{"skip" => "bad_value"}, [:skip]) == []
    end

    test "parses for :skip and :limit together" do
      result = parse_pagination_params(%{"limit" => "3", "skip" => 2}, [:skip, :limit])
      assert result[:limit] == 3
      assert result[:skip] == 2

      result = parse_pagination_params(%{"limit" => 3, "skip" => "2"}, [:skip, :limit])
      assert result[:limit] == 3
      assert result[:skip] == 2
    end
  end
end
