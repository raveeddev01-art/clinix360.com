defmodule StitchWeb do
  @version Application.get_env(:stitch_web, :version) || Stitch.Web.Mixfile.project()[:version]

  def version, do: @version
end
