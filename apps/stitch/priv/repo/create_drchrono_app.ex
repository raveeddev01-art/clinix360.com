defmodule Stitch.Repo.Scripts.CreateDrchronoApp do
  # mix run apps/stitch/priv/repo/create_drchrono_app.ex

  def run do
    {:ok, _app} =
      Stitch.App.create(%{
        name: "drchrono",
        icon_url: "https://zephyr.teamstitchapp.com/images/drchrono-logo.png",
        description:
          "drchrono EHR is a fully integrated electronic medical records, medical billing, RCM and practice management platform. Our mobile electronic health record app was voted #1 by doctors four years in a row."
      })
  end
end

Stitch.Repo.Scripts.CreateDrchronoApp.run()
