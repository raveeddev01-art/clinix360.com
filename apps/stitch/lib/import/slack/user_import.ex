defmodule Stitch.Import.Slack.UserImport do
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
      slack_import_id: user_json["id"]
    }

    if attributes.email do
      if Stitch.Repo.get_by(Stitch.Accounts.User, team_id: team.id, email: attributes.email) ==
           nil do
        Stitch.Repo.insert(attributes)
      else
        IO.puts(
          "Skipping existing user: #{inspect(%{team_id: team.id, email: attributes.email})}"
        )
      end
    else
      if Stitch.Repo.get_by(Stitch.Accounts.User, team_id: team.id, username: attributes.username) ==
           nil do
        Stitch.Repo.insert(attributes)
      else
        IO.puts(
          "Skipping existing user: #{inspect(%{team_id: team.id, username: attributes.username})}"
        )
      end
    end
  end

  def get_roles(user_json) do
    if user_json["is_admin"] == true || user_json["is_owner"] == true ||
         user_json["is_primary_owner"] == true do
      ["admin"]
    else
      ["member"]
    end
  end

  def get_first_name(user_json) do
    first_name = get_in(user_json, ["profile", "first_name"])
    first_name = first_name && first_name |> String.trim()

    if first_name == "" do
      String.split(get_in(user_json, ["profile", "real_name"])) |> List.first() ||
        String.split(get_in(user_json, ["profile", "display_name"])) |> List.first() ||
        user_json["name"]
    else
      first_name
    end
  end

  def get_last_name(user_json) do
    last_name = get_in(user_json, ["profile", "last_name"])
    last_name = last_name && last_name |> String.trim()

    if last_name == "" do
      String.split(get_in(user_json, ["profile", "real_name"])) |> List.last() ||
        String.split(get_in(user_json, ["profile", "display_name"])) |> List.last() ||
        user_json["name"]
    else
      last_name
    end
  end

  def get_phone_number(user_json) do
    get_in(user_json, ["profile", "phone"])
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
          IO.puts("[#{__MODULE__}] #{inspect(error)}")
      end
    end)
  end
end
