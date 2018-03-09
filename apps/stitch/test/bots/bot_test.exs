defmodule Stitch.BotTest do
  use ExUnit.Case, async: true
  import Stitch.Factory
  alias Stitch.Bot

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.Bot.team_bots?/2" do
    test "returns list of bots for a team" do
      team = insert(:team)
      {:ok, bot} = Bot.create(team.id, %{name: "Athena Health", profile_image_url: "a"})
      {:ok, bot} = Bot.create(team.id, %{name: "Doctor Chrono", profile_image_url: "a"})
      insert(:user, %{is_bot: true, team_id: team.id, disabled: true})
      bots = Bot.team_bots(team.id)
      assert length(bots) == 3
    end

    test "it also returns disabled bots" do
      team = insert(:team)
      {:ok, bot} = Bot.create(team.id, %{name: "Athena Health", profile_image_url: "a"})
      insert(:user, %{is_bot: true, team_id: team.id, disabled: true})
      bots = Bot.team_bots(team.id)
      assert length(bots) == 2
    end
  end

  describe "Stitch.Bot.create/1" do
    test "creates bot account using params" do
      team = insert(:team)

      {:ok, bot} =
        Bot.create(team.id, %{team_id: 34343, name: "Athena Health", profile_image_url: "a"})

      assert bot.username == "athenahealthbot"
      assert bot.first_name == "Athena Health"
      assert bot.last_name == "Bot"
      assert bot.team_id == team.id
      assert bot.disabled == false
    end

    test "returns error for invalid properties" do
      team = insert(:team)

      {:error, changeset} =
        Bot.create(team.id, %{team_id: 345, name: "ASDFD#$(*&", profile_image_url: ""})

      assert length(changeset.errors) == 2
    end
  end

  describe "Stitch.Bot.update/1" do
    test "updates bot account using params" do
      team = insert(:team)
      {:ok, bot} = Bot.create(team.id, %{name: "Athena Health", profile_image_url: "a"})
      {:ok, bot} = Bot.update(bot.id, %{name: "New Name", profile_image_url: "abc"})
      assert bot.first_name == "New Name"
      assert bot.last_name == "Bot"
      assert bot.username == "newnamebot"
    end

    test "returns error for invalid properties" do
      team = insert(:team)
      {:ok, bot} = Bot.create(team.id, %{name: "Athena Health", profile_image_url: "a"})

      {:error, changeset} = Bot.update(bot.id, %{name: "ASDFD#$(*&", profile_image_url: ""})

      assert length(changeset.errors) == 2
    end
  end

  describe "Stitch.Bot.disable/1" do
    test "disabled bot account" do
      team = insert(:team)
      {:ok, bot} = Bot.create(team.id, %{name: "Athena Health", profile_image_url: "a"})
      {:ok, bot} = Bot.disable(bot.id)
      assert bot.disabled == true
    end
  end
end
