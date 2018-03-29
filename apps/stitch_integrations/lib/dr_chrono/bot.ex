defmodule StitchIntegrations.DrChrono.Bot do
  import Ecto.Query
  alias Stitch.{Accounts.User, Message}
  alias Stitch.Repo
  alias StitchConnect.Web.UserStatusService
  require Logger

  def init_or_enable_bot(team_id) do
    bot_user =
      from(
        u in User,
        where: u.team_id == ^team_id,
        where: u.is_bot == true,
        where: u.onboarded == true,
        where: u.username == "drchrono",
        select: u
      )
      |> Repo.one()

    bot_user =
      if bot_user == nil do
        {:ok, bot_user} =
          Stitch.Bot.create(team_id, %{
            team_id: team_id,
            name: "Dr Chrono",
            username: "drchrono",
            is_bot: true,
            onboarded: true,
            roles: ["member", "bot"],
            disabled: false,
            profile_image_url: "a"
          })

        bot_user
      end

    {:ok, bot_user}
  end

  def get_bot(team_id) do
    from(
      u in User,
      where: u.team_id == ^team_id,
      where: u.username == "drchrono",
      where: u.is_bot == true,
      where: u.disabled == false,
      select: u
    )
    |> Repo.one()
  end

  def post_message(team_id, group_id, text_content) do
    bot_user = get_bot(team_id)
    group = Stitch.GroupQueries.get_by_id(group_id)

    message_params = %{
      "text_content" => text_content,
      "type" => "chat"
    }

    presence_user_ids = UserStatusService.presence_user_ids(team_id)

    case Message.create(group_id, bot_user, message_params, presence_user_ids) do
      {:ok, %{message: message, notify_user_ids: notify_user_ids}} ->
        message = Stitch.Repo.preload(message, :user)
        StitchConnect.Web.EventsChannel.broadcast_group_new_msg(group, message, notify_user_ids)

      {:error, _} ->
        Logger.error("Couldn't post DrChrono bot message.")
    end
  end
end
