defmodule Stitch.Repo.Scripts.CreateDrchronoApp do
  # mix run apps/stitch/priv/repo/create_drchrono_app.ex

  def run do
    {:ok, _app} =
      Stitch.App.create(%{
        name: "drchrono",
        icon_url: "https://zephyr.teamstitchapp.com/images/drchrono-logo.png",
        description:
          "All-in-one practice management, electronic health records and billing solutions."
      })
  end
end

Stitch.Repo.Scripts.CreateDrchronoApp.run()
