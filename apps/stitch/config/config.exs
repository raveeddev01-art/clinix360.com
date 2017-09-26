use Mix.Config

config :stitch, ecto_repos: [Stitch.Repo]

config :stitch, Stitch.MessageMailer,
  jobs: [
    # Every 15 minutes
    {"*/15 * * * *",   {Stitch.MessageMailer, :deliver, ["15min"]}},

    # Every hour
    {"0 * * * *",      {Stitch.MessageMailer, :deliver, ["hourly"]}},

    # Every midnight
    {"@daily",         {Stitch.MessageMailer, :deliver, ["daily"]}},
  ],
  global: true,
  timeout: 10 * 60 * 1_000

import_config "#{Mix.env}.exs"
