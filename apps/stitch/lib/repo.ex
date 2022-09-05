defmodule Stitch.Repo do
  use Ecto.Repo, otp_app: :stitch, log: false, adapter: Ecto.Adapters.Postgres
end
