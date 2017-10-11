defmodule StitchConnect do
  @version Application.get_env(:stitch_connect, :version) || StitchConnect.Mixfile.project[:version]

  def version, do: @version
end
