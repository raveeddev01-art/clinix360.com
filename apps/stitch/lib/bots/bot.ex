defmodule Stitch.Bot do
  import Ecto.Query
  import Ecto.Changeset
  alias Stitch.Repo
  alias Stitch.Accounts.User

  @moduledoc """
  Allows team Administrators to use bots that can communicate
  on the Stitch Connect application.
  """

  def changeset(%User{} = struct, attrs) do
    attrs = set_name_from_bot_name(attrs)

    struct
    |> cast(attrs, [:first_name, :last_name, :username, :team_id, :profile_image_url])
    |> User.username_changeset(attrs)
    |> validate_required([:first_name, :last_name, :username, :profile_image_url])
    |> update_change(:first_name, &String.trim/1)
    |> update_change(:last_name, &String.trim/1)
    |> update_change(:username, &String.trim/1)
    |> put_change(:is_bot, true)
    |> Stitch.Validators.validate_no_emojis(:first_name)
    |> Stitch.Validators.validate_no_emojis(:last_name)
  end

  defp set_name_from_bot_name(attrs) do
    case Map.fetch(attrs, :name) do
      {:ok, name} ->
        username =
          name
          |> String.replace(" ", "")
          |> String.downcase()

        attrs
        |> Map.put(:first_name, name)
        |> Map.put(:last_name, "Bot")
        |> Map.put(:username, "#{username}bot")

      :error ->
        attrs
    end
  end

  @doc """
  Returns a list of existing bots for a Team.
  """
  @spec team_bots(number) :: {:ok, list}
  def team_bots(team_id) do
    query =
      from(
        u in User,
        where: u.team_id == ^team_id,
        where: u.is_bot == true,
        select: u
      )

    Repo.all(query)
  end

  @doc """
  Creates a bot using the given bot parameters for a team.
  """
  @spec create(number, map) :: {:ok, User.t()} | {:error, map}
  def create(team_id, bot_params) do
    bot_params = Map.put(bot_params, :team_id, team_id)
    changeset = changeset(%User{}, bot_params)
    Repo.insert(changeset)
  end

  @doc """
  Updates a bot's configuration including things like
  profile image, display name and more.
  """
  @spec update(number, map) :: {:ok, User.t()} | {:error, term}
  def update(bot_id, bot_params) do
    with bot when not is_nil(bot) <- Repo.get(User, bot_id) do
      changeset(bot, bot_params)
      |> Repo.update()
    else
      _ -> {:error, "This bot doesn't not exist."}
    end
  end

  @doc """
  Disables a bot, preventing it from communicating with
  people on the Stitch Connect platform.
  """
  @spec disable(number) :: {:ok, User.t()} | {:error, term}
  def disable(bot_id) do
    with bot when not is_nil(bot) <- Repo.get(User, bot_id) do
      bot
      |> Ecto.Changeset.change(disabled: true)
      |> Repo.update()
    else
      _ -> {:error, "This bot doesn't exist."}
    end
  end
end
