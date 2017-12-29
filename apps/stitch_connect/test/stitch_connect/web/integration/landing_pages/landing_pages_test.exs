defmodule StitchConnect.Web.Messages.LandingPagesTest do
  use StitchConnect.Web.FeatureCase, async: true

  import Wallaby.Query, only: [css: 2]

  defp element(selector, text), do: css(selector, text: text)

  test "landing page has all necessary elements" do
    {:ok, user_1_session} = Wallaby.start_session()

    # Create two messages in this group with complex sentences.
    user_1_session
    |> visit("http://localhost:4001")
    |> assert_has(element("h1", "Care Coordination"))
    |> assert_has(element(".btn-default", "Request Demo"))
    |> assert_has(element(".feature h2", "Connect"))
    |> assert_has(element(".feature h2", "Engage"))
    |> assert_has(element(".feature h2", "Manage"))
  end
end
