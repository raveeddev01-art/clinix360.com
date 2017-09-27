use Mix.Config

config :stitch, ecto_repos: [Stitch.Repo]

import_config "#{Mix.env}.exs"
