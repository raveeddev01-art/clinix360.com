use Mix.Config

config :stitch, ecto_repos: [Stitch.Repo]

config :stitch, :aws_presigned_urls, %{
  access_key_id: System.get_env("AWS_ACCESS_KEY_ID"),
  secret_access_key: System.get_env("AWS_SECRET_ACCESS_KEY"),
  region: "us-east-1",
  host: "s3.amazonaws.com",
  scheme: "https://"
}

config :ex_aws,
  access_key_id: [{:system, "AWS_ACCESS_KEY_ID"}, :instance_role],
  secret_access_key: [{:system, "AWS_SECRET_ACCESS_KEY"}, :instance_role],
  s3: [
    region: "us-east-1",
    host: "s3.amazonaws.com"
  ]

config :stripity_stripe,
  secret_key: System.get_env("STRIPE_SECRET_KEY")

config :stitch,
  stripe_client: Stitch.Stripe.Client,
  stripe_publishable_key: System.get_env("STRIPE_PUBLISHABLE_KEY")

import_config "#{Mix.env}.exs"
