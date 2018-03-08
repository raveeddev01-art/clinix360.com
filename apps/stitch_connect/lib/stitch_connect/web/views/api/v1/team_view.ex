defmodule StitchConnect.Web.Api.V1.TeamView do
  use StitchConnect.Web, :view

  def render("contact_info.json", %{team: team}) do
    %{
      id: team.id,
      name: team.name || "",
      company_name: team.company_name || "",
      address_line_one: team.address_line_one || "",
      address_line_two: team.address_line_two || "",
      city: team.city || "",
      state: team.state || "",
      country: team.country || "",
      zip_code: team.zip_code || ""
    }
  end

  def render("access_log.json", %{access_log: %Stitch.Paginator{data: data, meta: meta}}) do
    %{
      data: Enum.map(data, &render_access_log/1),
      meta: meta
    }
  end

  def render_access_log(access_log) do
    %{
      id: access_log.id,
      user_id: access_log.user_id,
      user_agent: access_log.user_agent,
      ip_address: access_log.ip_address,
      app_version: access_log.app_version,
      inserted_at: access_log.inserted_at,
      last_access_at: access_log.last_access_at,
      access_count: access_log.access_count,
    }
  end
end
