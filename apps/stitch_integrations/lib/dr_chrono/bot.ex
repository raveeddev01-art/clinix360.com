defmodule StitchIntegrations.DrChrono.Bot do
  import Ecto.Query
  alias Stitch.Repo

  def init_or_enable_bot(team_id) do
    bot_user =
      from(
        u in User,
        where: u.team_id == ^team_id,
        where: u.is_bot == true,
        where: u.first_name == "Dr",
        where: u.first_name == "Chrono",
        select: u
      )
      |> Repo.one()

    if bot_user == nil do
      Bot.create(team_id, %{
        team_id: team_id,
        name: "Dr Chrono",
        disabled: false,
        profile_image_url: "a"
      })
    end

    {:ok, bot_user}
  end
end
