defmodule Stitch.ExportInvochat.Groups do
  alias Stitch.ExportInvochat.Request
  alias Stitch.{Repo, Group}

  import Ecto.Query

  def team_common_channel(team_id) do
    url = "/GetTeamChannelId "
    body = %{"team_id" => team_id}
    Request.request_invochat(url, body)
  end

  def team_channel(team_id) do
    from(
      g in Group,
      where: g.team_id == ^team_id
    )
    |> Repo.all()
  end

  def add_users_channel() do

  end
end
