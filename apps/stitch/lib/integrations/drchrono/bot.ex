defmodule Stitch.Drchrono.Bot do
  import Ecto.Query
  alias Stitch.{Accounts.User, Message}
  alias Stitch.Repo
  alias StitchConnect.Web.{TeamChannel, UserStatusService}
  require Logger

  @spec init_or_enable_bot(number) :: {:ok, User.t()} | {:error, term}
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

    if bot_user == nil do
      create_and_broadcast(team_id)
    else
      {:ok, bot_user}
    end
  end

  defp create_and_broadcast(team_id) do
    bot_params = %{
      team_id: team_id,
      name: "drchrono",
      username: "drchrono",
      is_bot: true,
      onboarded: true,
      roles: ["member", "bot"],
      disabled: false,
      profile_image_url: "https://s3.amazonaws.com/stitch-content-public/drchrono-logo.png",
      profile_image_thumb_url: "https://s3.amazonaws.com/stitch-content-public/drchrono-logo.png"
    }

    case Stitch.Bot.create(team_id, bot_params) do
      {:ok, bot_user} ->
        TeamChannel.broadcast_user_joined(team_id, bot_user)
        {:ok, bot_user}

      error ->
        error
    end
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
    # Attempt to create a GroupUser for the bot, this is on
    # the fly because sometimes people change the room for the integration.
    Stitch.Group.add_user(group, bot_user)

    base_params = %{"text_content" => text_content, "type" => "chat"}
    message_params = Message.Params.with_client_attrs("bot", base_params)

    presence_user_ids = UserStatusService.presence_user_ids(team_id)

    case Message.create(group_id, bot_user, message_params, presence_user_ids) do
      {:ok, %{message: message, notify_user_ids: notify_user_ids}} ->
        message = Stitch.Repo.preload(message, :user)
        StitchConnect.Web.EventsChannel.broadcast_group_new_msg(group, message, notify_user_ids)
        StitchConnect.Web.GroupChannel.broadcast_message_created(message)

      {:error, _} ->
        Logger.error("Couldn't post drchrono bot message.")
    end
  end
end
