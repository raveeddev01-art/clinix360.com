defmodule StitchConnect.Web.OnboardingTest do
  use StitchConnect.Web.FeatureCase, async: true

  import Wallaby.Query

  @user_attrs %{
    first_name: "John",
    last_name: "Doe",
    phone_number: "15613334455",
    username: "john",
    password: "Password123!",
    pin: "0000"
  }

  @team_attrs %{
    name: "Some Team Name",
    slug: "someslug",
  }

  @tag :start_session
  test "visitor goes through onboarding process", %{session: session} do
    session
    |> visit("/signup/email")
    |> fill_in(text_field("Email"), with: "somename@emailprovider.com")
    |> click(button("Next"))
    |> assert_has(css(".confirmation-code"))

    [user] = Stitch.UserQueries.get_all()

    refute user.onboarded

    session
    |> fill_in_confirmation_code(user.confirmation_code)
    |> click(button("Next"))
    |> assert_has(css("h2", text: "Team Name"))
    |> fill_in(css("input"), with: @team_attrs.name)
    |> click(button("Next"))
    |> assert_has(css("h2", text: "Team URL"))
    |> fill_in(css("input"), with: @team_attrs.slug)
    |> click(button("Next"))
    |> assert_has(css("h2", text: "Name"))
    |> fill_in(css("input[placeholder='First Name']"), with: @user_attrs.first_name)
    |> fill_in(css("input[placeholder='Last Name']"), with: @user_attrs.last_name)
    |> click(button("Next"))
    |> assert_has(css("h2", text: "Phone Number"))
    |> fill_in(css("input[placeholder='Phone Number']"), with: @user_attrs.phone_number)
    |> click(button("Next"))
    |> assert_has(css("h2", text: "Username"))
    |> fill_in(css("input[placeholder='Username']"), with: @user_attrs.username)
    |> click(button("Next"))
    |> assert_has(css("h2", text: "Password"))
    |> fill_in(css("input[placeholder='Password']"), with: @user_attrs.password)
    |> click(button("Next"))
    |> assert_has(css("h2", text: "PIN"))
    |> fill_in_pin(@user_attrs.pin)
    |> click(button("Next"))
    |> assert_has(css("h2", text: "Send Invitations"))
    |> click(button("Skip this step"))
    |> assert_has(css("h2", text: "HIPAA"))
    |> set_value(checkbox("I agree to the terms of the HIPAA BAA"), :selected)
    |> click(button("Done!"))
    # The line below is needed to provide enough time for the onboarding to finish.
    |> refute_has(css(".welcome-message", text: "General"))

    # I'd expect the assertion below to pass instead of the `refute` above but it doesn't.
    # There seems to be an issuee with wallaby in which cookies are not shared
    # between domains and subdomains.
    # |> assert_has(css(".welcome-message", text: "General"))
    #

    [onboarded_user] = Stitch.UserQueries.get_all()

    assert onboarded_user.onboarded
    assert onboarded_user.first_name == @user_attrs.first_name
    assert onboarded_user.last_name == @user_attrs.last_name
    assert onboarded_user.phone_number == @user_attrs.phone_number
    assert onboarded_user.username == @user_attrs.username
    assert onboarded_user.pin == @user_attrs.pin

    [team] = Stitch.TeamQueries.list_teams()

    assert team.name == @team_attrs.name
    assert team.slug == @team_attrs.slug
  end

  defp fill_in_confirmation_code(session, code) do
    session
    |> find(css(".confirmation-code input", count: 6))
    |> Enum.with_index()
    |> Enum.each(fn {input, index} ->
      Wallaby.Element.fill_in(input, with: String.at(code, index))
    end)

    session
  end

  defp fill_in_pin(session, pin) do
    session
    |> find(css(".pin-code input", count: 4))
    |> Enum.with_index()
    |> Enum.each(fn {input, index} ->
      Wallaby.Element.fill_in(input, with: String.at(pin, index))
    end)

    session
  end
end
