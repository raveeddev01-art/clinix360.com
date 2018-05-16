use Mix.Config

config :stitch, ecto_repos: [Stitch.Repo]

config :stripity_stripe, secret_key: System.get_env("STRIPE_SECRET_KEY")

config :stitch,
  stripe_client: Stitch.Stripe.Client,
  stripe_publishable_key: System.get_env("STRIPE_PUBLISHABLE_KEY")

config :stitch, :twilio, %{
  account_sid: System.get_env("TWILIO_ACCOUNT_SID"),
  auth_token: System.get_env("TWILIO_AUTH_TOKEN")
}

config :ex_aws,
  access_key_id: [{:system, "AWS_ACCESS_KEY_ID"}, :instance_role],
  secret_access_key: [{:system, "AWS_SECRET_ACCESS_KEY"}, :instance_role],
  s3: [
    region: System.get_env("S3_REGION"),
    host: "s3.amazonaws.com"
  ]

config :stitch, :aws_user_upload, %{
  access_key_id: System.get_env("AWS_ACCESS_KEY_ID"),
  secret_access_key: System.get_env("AWS_SECRET_ACCESS_KEY"),
  region: System.get_env("S3_REGION"),
  bucket: System.get_env("S3_BUCKET_NAME"),
  scheme: "https://",
  host: "s3.amazonaws.com",
  # in bytes, 1 GB
  upload_size_cap: 1_000_000_000
}

config :stitch, :user_upload_settings, %{
  max_preview_width: 720,
  max_preview_height: 720
}

config :porcelain, :goon_warn_if_missing, false

config :stitch, :redix, %{
  pool_size: 5,
  url: System.get_env("REDIS_URL")
}

config :ua_inspector,
  database_path: System.get_env("UA_INSPECTOR_DB_PATH") || "./apps/stitch/priv/ua_inspector"

config :exq,
  host: System.get_env("REDIS_URL") || "127.0.0.1",
  port: 6379,
  namespace: "exq",
  # keep concurrency low for db's sake
  concurrency: 20,
  queues: ["transactional_messages"],
  poll_timeout: 50,
  scheduler_poll_timeout: 200

config :exq_ui,
  web_port: 4040,
  web_namespace: "jobs",
  server: true

import_config "#{Mix.env()}.exs"
