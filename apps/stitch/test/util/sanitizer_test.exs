defmodule Stitch.Util.SanitizerTest do
  use Stitch.DataCase, async: true
  alias Stitch.Util.Sanitizer

  describe "Stitch.Util.Sanitizer.keep_lower_alphanumeric/1" do
    test "removes all non alphanumeric characters" do
      values = [
        {"Brenda", "brenda"},
        {"AaronE", "aarone"},
        {"Ash.whipporwill", "ashwhipporwill"},
        {"P.W", "pw"},
        {"000", "000"},
        {"EGAMEZ", "egamez"},
        {"MOOmoo13", "moomoo13"}
      ]

      for {dirty_value, sanitized_value} <- values do
        end_result = Sanitizer.keep_lower_alphanumeric(dirty_value)
        assert end_result == sanitized_value
      end
    end
  end
end
