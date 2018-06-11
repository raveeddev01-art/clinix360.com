defmodule Stitch.Web.Messages.LandingPagesTest do
  use Stitch.Web.FeatureCase

  defp element(selector, text), do: css(selector, text: text)

  test "landing page has all necessary elements" do
    {:ok, user_1_session} = Wallaby.start_session()

    # Create two messages in this group with complex sentences.
    user_1_session
    |> visit("http://localhost:4001")
    |> assert_has(element("h1", "Deliver a great patient experience"))
    |> assert_has(element(".btn-trial a", "Get Started"))
    |> assert_has(element(".panel-body h3", "Connect"))
    |> assert_has(element(".panel-body h3", "Engage"))
    |> assert_has(element(".panel-body h3", "Manage"))
  end
end
