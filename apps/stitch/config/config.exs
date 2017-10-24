use Mix.Config

config :stitch, ecto_repos: [Stitch.Repo]

config :stripity_stripe,
  secret_key: System.get_env("STRIPE_SECRET_KEY")

config :stitch,
  stripe_client: Stitch.Stripe.Client

import_config "#{Mix.env}.exs"
