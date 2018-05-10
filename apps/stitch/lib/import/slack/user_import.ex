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
    attributes = %{
      team_id: team.id,
      first_name: get_first_name(user_json),
      last_name: get_last_name(user_json)
    }

    Stitch.Repo.insert(Stitch.Accounts.User, attributes)
  end

  def get_first_name(user_json) do
    get_in(user_json, ["profile", "first_name"]) ||
      String.split(get_in(user_json, ["profile", "real_name"])) |> List.first() ||
      String.split(get_in(user_json, ["profile", "display_name"])) |> List.first() ||
      user_json["name"]
  end

  def get_last_name(user_json) do
    get_in(user_json, ["profile", "last_name"]) ||
      String.split(get_in(user_json, ["profile", "real_name"])) |> List.last() ||
      String.split(get_in(user_json, ["profile", "display_name"])) |> List.last() ||
      user_json["name"]
  end
end
