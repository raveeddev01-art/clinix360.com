import Config

config :stitch, ecto_repos: [Stitch.Repo]

config :stitch, :read_repo, Stitch.ReadReplicaRepo

config :stripity_stripe, api_key: System.get_env("STRIPE_SECRET_KEY")

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

config :stitch, :avatar, %{
  bucket: System.get_env("S3_AVATAR_BUCKET_NAME"),
  origin: System.get_env("AVATAR_ORIGIN")
}

config :stitch, :user_upload_settings, %{
  max_preview_width: 720,
  max_preview_height: 720
}

config :stitch, :public_cdn, %{
  origin: System.get_env("PUBLIC_CDN_ORIGIN"),
  bucket: System.get_env("S3_PUBLIC_BUCKET_NAME")
}

config :porcelain, :goon_warn_if_missing, false

config :stitch, :redix, %{
  pool_size: 5,
  url: System.get_env("REDIS_URL")
}

config :ua_inspector,
  database_path: System.get_env("UA_INSPECTOR_DB_PATH") || "./apps/stitch/priv/ua_inspector"

config :exq,
  url: System.get_env("REDIS_URL"),
  namespace: "exq",
  queues: [{"timed_messages", 10}],
  poll_timeout: 50,
  scheduler_poll_timeout: 200,
  max_retries: 5

config :exq_ui,
  web_port: 4040,
  web_namespace: "jobs",
  server: true

config :stitch, Tokbox,
  iss: System.get_env("TOKBOX_PROJECT"),
  key: System.get_env("TOKBOX_API_KEY"),
  secret: System.get_env("TOKBOX_SECRET"),
  ttl: 60 * 5

import_config "elasticsearch.exs"
import_config "#{Mix.env()}.exs"
