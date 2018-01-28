defmodule Stitch.Util.SanitizerTest do
  use Stitch.DataCase, async: true
  alias Stitch.Util.Sanitizer

  describe "Stitch.Util.Sanitizer.keep_lower_alphanumeric/1" do
    test "removes all non alphanumeric characters" do
      values = [
        {"Ash.whipporwill", "ashwhipporwill"},
        {"P.W", "pw"},
        {"Sergio!-_--.Si", "sergiosi"}
      ]

      for {dirty_value, sanitized_value} <- values do
        end_result = Sanitizer.keep_lower_alphanumeric(dirty_value)
        assert end_result == sanitized_value
      end
    end

    test "ignores clean strings" do
      values = [
        {"brenda", "brenda"},
        {"ash123", "ash123"},
        {"0000", "0000"}
      ]

      for {dirty_value, sanitized_value} <- values do
        end_result = Sanitizer.keep_lower_alphanumeric(dirty_value)
        assert end_result == sanitized_value
      end
    end
  end
end
