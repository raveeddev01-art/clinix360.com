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

    {:ok, _app} =
      Stitch.App.create(%{
        name: "Sentry",
        icon_url: "https://a.slack-edge.com/95b9/img/services/sentry_512.png",
        description: sentry_description
      })

    jira_description = """
    Jira helps every team reach their full potential with powerful workflow and project tracking.

    With the Jira Cloud app, you can stay up to date with Jira without leaving Slack. @jirabot is at your service, sending customizable notifications from Jira Cloud to you and your channels. Once you've connected a project to your channel, @jirabot will automatically preview Jira issues when they're mentioned.

    It's simple to set up subscriptions to one or more projects for your channel, and super-customizable notifications mean you can focus on the important stuff.
    """

    {:ok, _app} =
      Stitch.App.create(%{
        name: "JIRA",
        icon_url:
          "https://slack-files2.s3-us-west-2.amazonaws.com/avatars/2017-09-11/239622728805_193a5464df40bdbdb528_512.png",
        description: jira_description
      })
  end
end

Stitch.Repo.Scripts.CreateDrchronoApp.run()
