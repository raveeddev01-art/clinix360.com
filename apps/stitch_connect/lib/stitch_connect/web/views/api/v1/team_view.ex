defmodule StitchConnect.Web.Api.V1.TeamView do
  use StitchConnect.Web, :view

  def render("contact_info.json", %{team: team}) do
    %{
      id: team.id,
      name: team.name,
      company_name: team.company_name,
      address_line_one: team.address_line_one,
      address_line_two: team.address_line_two,
      city: team.city,
      state: team.state,
      country: team.country,
      zip_code: team.zip_code
    }
  end
end
