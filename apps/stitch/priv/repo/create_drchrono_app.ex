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

    sentry_description = """
    Sentry is an event logging platform primarily focused on capturing and aggregating exceptions. It supports many popular languages and platforms, including Python, PHP, Java, Ruby, Node.js, and even JavaScript.
    This integration will post notifications to a channel in Slack when Sentry detects an exception in your application.
    """
end

Stitch.Repo.Scripts.CreateDrchronoApp.run()
