defmodule StitchConnect.Web.Authentication.SignInSignOutTest do
  use StitchConnect.Web.FeatureCase, async: false

  import Wallaby.Query
  import Stitch.Factory

  @tag :start_session
  test "sign in with valid credentials and sign out", %{session: session} do
    team = Stitch.Team.Onboarding.create_team("Some Team Name", "someslug")
    user = insert(:user, email: "someuser@somecompany.com", team: team)

    session
    |> visit("http://#{team.slug}.localhost:4001/login")
    |> assert_has(css(".authentication-card", text: team.name))
    |> fill_in(text_field("Email"), with: user.email)
    |> fill_in(text_field("Password"), with: "password")
    |> click(button("Login"))
    |> assert_has(css(".authentication-card", text: "Desktop App"))
    |> click(xpath("//a[.='Skip & Launch']"))
    |> assert_has(css(".welcome-message", text: "Welcome to the public room General"))
    |> click(xpath("//a[@href='/logout']"))
    |> assert_has(css(".authentication-card", text: "Signed Out"))
  end
end
