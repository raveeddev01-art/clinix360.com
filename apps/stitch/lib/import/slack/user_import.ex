defmodule Stitch.Import.Slack.UserImport do
  alias Stitch.{Repo, Group, Accounts.User}

  require Logger

  # Expected input:
  # %{
  #   "id" => "user_id",
  #   "team_id" => "team_id",
  #   "name" => "username",
  #   "deleted" => true,
  #   "profile" => %{
  #       "title" => "",
  #       "phone" => "",
  #       "skype" => "",
  #       "real_name" => "A B",
  #       "real_name_normalized" => "A B",
  #       "display_name" => "username",
  #       "display_name_normalized" => "username",
  #       "fields" => null,
  #       "status_text" => "",
  #       "status_emoji" => "",
  #       "status_expiration" => 0,
  #       "avatar_hash" => "",
  #       "email" => "email@email.com",
  #       "first_name" => "A",
  #       "last_name" => "B",
  #       "status_text_canonical" => "",
  #       "team" => "_team_id"
  #   },
  #   "is_bot" => false,
  #   "is_app_user" => false
  # }

  def parse_json(team, user_json) do
    attributes = %Stitch.Accounts.User{
      team_id: team.id,
      email: get_in(user_json, ["profile", "email"]),
      first_name: get_first_name(user_json),
      last_name: get_last_name(user_json),
      username: user_json["name"],
      is_bot: user_json["is_bot"],
      pin: "0000",
      phone_number: get_phone_number(user_json),
      roles: get_roles(user_json),
      slack_import_id: user_json["id"],
      onboarded: true,
      password_hash: Comeonin.Bcrypt.hashpwsalt(Stitch.Rand.token(32)),
      token: Stitch.Rand.token(32),
      disabled: user_json["deleted"] == true
    }

    if attributes.email do
      if Stitch.Repo.get_by(Stitch.Accounts.User, team_id: team.id, email: attributes.email) ==
           nil do
        Stitch.Repo.insert(attributes) |> log_if_error(user_json)
      else
        IO.puts(
          "Skipping existing user: #{inspect(%{team_id: team.id, email: attributes.email})}"
        )
      end
    else
      if Stitch.Repo.get_by(Stitch.Accounts.User, team_id: team.id, username: attributes.username) ==
           nil do
        Stitch.Repo.insert(attributes) |> log_if_error(user_json)
      else
        IO.puts(
          "Skipping existing user: #{inspect(%{team_id: team.id, username: attributes.username})}"
        )
      end
    end
  end

  def get_roles(user_json) do
    case user_json do
      %{"is_admin" => true} -> ["admin"]
      %{"is_owner" => true} -> ["admin"]
      %{"is_primary_owner" => true} -> ["admin"]
      %{"is_restricted" => true} -> ["multi-room-guest"]
      %{"is_ultra_restricted" => true} -> ["single-room-guest"]
      _ -> ["member"]
    end
  end

  def get_first_name(user_json) do
    first_name = get_in(user_json, ["profile", "first_name"])
    first_name = first_name && first_name |> String.trim()

    if first_name == nil || first_name == "" do
      try_split(get_in(user_json, ["profile", "real_name"])) |> List.first() ||
        try_split(get_in(user_json, ["profile", "display_name"])) |> List.first() ||
        user_json["name"]
    else
      first_name
    end
  end

  def get_last_name(user_json) do
    last_name = get_in(user_json, ["profile", "last_name"])
    last_name = last_name && last_name |> String.trim()

    if last_name == nil || last_name == "" do
      try_split(get_in(user_json, ["profile", "real_name"])) |> List.last() ||
        try_split(get_in(user_json, ["profile", "display_name"])) |> List.last() ||
        user_json["name"]
    else
      last_name
    end
  end

  def try_split(nil), do: []
  def try_split(string), do: String.split(string)

  def get_phone_number(user_json) do
    get_in(user_json, ["profile", "phone"]) || "+"
  end

  def generate_default_avatars(team) do
    users = Stitch.TeamQueries.list_users(team)

    Enum.each(users, fn user ->
      with {:ok, avatar} <- Stitch.Accounts.ProfileImage.pick_default_random(user),
           {:ok, avatar_thumb} <- Stitch.Accounts.ProfileImage.create_thumb(avatar) do
        Stitch.Repo.update(
          Ecto.Changeset.change(
            user,
            profile_image_url: avatar,
            profile_image_thumb_url: avatar_thumb
          )
        )
      else
        error ->
          Logger.error("[#{__MODULE__}] #{inspect(error)}")
      end
    end)
  end

  def log_if_error({:ok, _user} = result, _user_json), do: result

  def log_if_error({:error, error} = result, user_json) do
    Logger.error("[#{__MODULE__}] #{inspect(error)} #{inspect(user_json)}")
    result
  end

  def add_guest(team, %{"is_ultra_restricted" => true} = user_json) do
    do_add_guest(team, user_json)
  end

  def add_guest(team, %{"is_restricted" => true} = user_json) do
    do_add_guest(team, user_json)
  end

  def add_guest(_team, _json) do
    {:error, "Not a guest"}
  end

  def do_add_guest(team, %{"id" => slack_user_id} = user_json) do
    with guest_channels_json when not is_nil(guest_channels_json) <-
           get_in(user_json, ["profile", "guest_channels"]),
         {:ok, guest_channels} when is_list(guest_channels) <- Poison.decode(guest_channels_json),
         guest_groups <- get_groups_for_slack_ids(team, guest_channels),
         %User{} = user <- Repo.get_by(User, team_id: team.id, slack_import_id: slack_user_id),
         {:ok, user} <- update_groups_as_guest(user, guest_groups) do
      Stitch.Accounts.Admin.update_user_groups(user)
    else
      error ->
        Logger.error("[#{__MODULE__}] #{inspect(error)} #{inspect(user_json)}")
        error
    end
  end

  def update_groups_as_guest(user, []) do
    {:error, "Guest is not a member of any group #{inspect(%{user_id: user.id})}"}
  end

  def update_groups_as_guest(user, guest_groups) do
    user
    |> Ecto.Changeset.change(groups_as_guest: guest_groups)
    |> Repo.update()
  end

  def get_groups_for_slack_ids(team, guest_channels) do
    guest_channels
    |> Enum.map(fn slack_channel_id ->
      Repo.get_by(Group, team_id: team.id, slack_import_id: slack_channel_id)
    end)
    |> Enum.filter(&(&1 != nil))
    |> Enum.map(& &1.id)
  end
end
