defmodule StitchConnect.Web.IntegrationTestHelper do
  use Wallaby.DSL
  import Wallaby.Query, only: [text_field: 1, button: 1, xpath: 1]

  def sign_in(session, team, user) do
    session
    |> visit("http://#{team.slug}.localhost:4001/login")
    |> fill_in(text_field("Email"), with: user.email)
    |> fill_in(text_field("Password"), with: "password")
    |> click(button("Login"))
    |> click(xpath("//a[.='Skip & Launch']"))
  end
end
