defmodule StitchConnect.Web.Messages.SearchTest do
  use StitchConnect.Web.FeatureCase, async: false

  import Wallaby.Query, only: [css: 2]

  defp element(selector, text), do: css(selector, text: text)

  test "user can search for messages in his team" do
    {:ok, user_1_session} = Wallaby.start_session()

    # Create two messages in this group with complex sentences.
    user_1_session
    |> visit("http://localhost:4001")
    |> assert_has(element("h1", "The workspace for healthcare teams"))
    |> assert_has(element(".subheader .btn-default", "REQUEST DEMO"))
    |> assert_has(element(".subheader .btn-primary", "START TRIAL"))
    |> assert_has(element(".feature h2", "Connect"))
    |> assert_has(element(".feature h2", "Engage"))
    |> assert_has(element(".feature h2", "Manage"))
    |> assert_has(element(".get-started .btn-primary", "START TRIAL"))
    |> assert_has(element(".get-started .btn-default", "SCHEDULE DEMO"))
  end
end
