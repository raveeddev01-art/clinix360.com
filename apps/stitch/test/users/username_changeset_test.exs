defmodule Stitch.Accounts.User.ChangesetTest do
  use Stitch.DataCase, async: true
  alias Stitch.Accounts.User

  test "invalid when not in params" do
    refute User.username_changeset(%User{}, %{}).valid?
  end

  test "invalid when nil" do
    refute User.username_changeset(%User{}, %{username: nil}).valid?
  end

  test "invalid when empty string" do
    refute User.username_changeset(%User{}, %{username: ""}).valid?
  end

  test "invalid when less than 2 characters" do
    refute User.username_changeset(%User{}, %{username: "a"}).valid?
  end

  test "invalid when more than 50 characters" do
    refute User.username_changeset(%User{}, %{username: String.duplicate("a", 51)}).valid?
  end

  test "invalid when it doesn't start with a lowercase letter or a number" do
    """
    A`-=[]\;',./ ~!@#$%^&*()_+{}|:"<>?
    """
    |> String.split("", trim: true)
    |> Enum.each(fn char ->
      refute User.username_changeset(%User{}, %{username: "#{char}ab"}).valid?
    end)
  end

  test "invalid when it contains uppercase letters or special characters other than period, dash or underscore" do
    """
    A`=[]\;',/ ~!@#$%^&*()+{}|:"<>?
    """
    |> String.split("", trim: true)
    |> Enum.each(fn char ->
      refute User.username_changeset(%User{}, %{username: "a#{char}b"}).valid?
    end)
  end

  test "invalid when an existing user with the same username exists for the given team_id" do
    team = insert(:team)
    insert(:user, team: team, username: "foobar")

    refute User.username_changeset(%User{}, %{team_id: team.id, username: "foobar"}).valid?
  end

  test "valid when team_id is not in params, even when an existing user with the same username exists" do
    team = insert(:team)
    insert(:user, team: team, username: "foobar")

    assert User.username_changeset(%User{}, %{username: "foobar"}).valid?
  end

  test "valid when team_id is nil, even when an existing user with the same username exists" do
    team = insert(:team)
    insert(:user, team: team, username: "foobar")

    assert User.username_changeset(%User{}, %{team_id: nil, username: "foobar"}).valid?
  end

  test "valid characters are lowercase letters and numbers" do
    assert User.username_changeset(%User{}, %{username: "a1"}).valid?
  end
end