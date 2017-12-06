defmodule StitchConnect.Web.LandingPagesTest do
  use StitchConnect.Web.FeatureCase, async: true

  import Wallaby.Query, only: [css: 2]

  test "home page has welcome message", %{session: session} do
    session
    |> visit("/")
    |> assert_has(
      css(
        ".landing-message h3",
        text: "Communicate, write notes, track tasks"
      )
    )
  end

  test "connect page has Connect product information", %{session: session} do
    session
    |> visit("/connect")
    |> assert_has(
      css(
        ".product-info h2",
        text: "Secure all your healthcare communication in one place."
      )
    )
  end

  test "pricing page has pricing information", %{session: session} do
    session
    |> visit("/pricing")
    |> assert_has(
      css(
        ".landing-message h3",
        text: "Free to start, upgrade when you need."
      )
    )
  end

  test "downloads page shows clients to download", %{session: session} do
    session
    |> visit("/downloads")
    |> assert_has(css("h3", text: "Mac"))
    |> assert_has(css("h3", text: "Windows"))
    |> assert_has(css("h3", text: "iOS"))
    |> assert_has(css("h3", text: "Android"))
  end
end
