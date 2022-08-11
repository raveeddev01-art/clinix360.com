defmodule Stitch.ReadReplicaRepo do
  use Ecto.Repo, otp_app: :stitch, adapter: Ecto.Adapters.Postgres
end
