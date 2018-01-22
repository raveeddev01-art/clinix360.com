defmodule Stitch.Accounts.AdminTest do
  use Stitch.DataCase, async: true

  describe "Stitch.Accounts.Admin.activate/2" do
    setup do
      team = insert(:team)
      {:ok, team: team}
    end

    test "actives an active account", %{team: team} do
      user = insert(:user, team: team, disabled: false)
      {:ok, user} = Stitch.Accounts.Admin.activate(team, user.id)
      refute user.disabled
    end

    test "actives a deactived account", %{team: team} do
      user = insert(:user, team: team, disabled: false)
      {:ok, user} = Stitch.Accounts.Admin.activate(team, user.id)
      refute user.disabled
    end

    test "gives error when user isn't found", %{team: team} do
      assert {:error, :not_found} == Stitch.Accounts.Admin.activate(team, -1)
    end

    test "gives errors when modifying users from other teams", %{team: team} do
      other_team = insert(:team)
      other_team_user = insert(:user, team: other_team)
      assert {:error, :not_found} == Stitch.Accounts.Admin.activate(team, other_team_user.id)
    end
  end

  describe "Stitch.Accounts.Admin.deactivate/2" do
    setup do
      team = insert(:team)
      {:ok, team: team}
    end

    test "deactives an active account", %{team: team} do
      user = insert(:user, team: team, disabled: false)
      {:ok, user} = Stitch.Accounts.Admin.deactivate(team, user.id)
      assert user.disabled == true
    end

    test "deactives a deactived account", %{team: team} do
      user = insert(:user, team: team, disabled: false)
      {:ok, user} = Stitch.Accounts.Admin.deactivate(team, user.id)
      assert user.disabled == true
    end

    test "gives error when user isn't found", %{team: team} do
      assert {:error, :not_found} == Stitch.Accounts.Admin.deactivate(team, -1)
    end

    test "gives errors when modifying users from other teams", %{team: team} do
      other_team = insert(:team)
      other_team_user = insert(:user, team: other_team)
      assert {:error, :not_found} == Stitch.Accounts.Admin.deactivate(team, other_team_user.id)
    end
  end

  describe "Stitch.Accounts.Admin.update_user/2" do
    test "it updates the first_name and last_name" do
      user = insert(:user, %{first_name: "John", last_name: "Doe"})
      {:ok, user} = Stitch.Accounts.Admin.update_user( user.id, %{first_name: "Jake", last_name: "Dough" })
      assert user.first_name == "Jake"
      assert user.last_name == "Dough"
    end

    test "it updates the phone_number" do
      user = insert(:user, %{phone_number: "1231231234"})
      {:ok, user} = Stitch.Accounts.Admin.update_user(user.id, %{phone_number: "9999999999"})
      assert user.phone_number == "9999999999"
    end

    test "it updates the title" do
      user = insert(:user, %{title: "Painter"})
      {:ok, user} = Stitch.Accounts.Admin.update_user(user.id, %{title: "Hardware" })
      assert user.title == "Hardware"
    end

    test "it updates the profile image url" do
      user = insert(:user, %{profile_image_url: "https://foobar.com/image.jpg"})
      {:ok, user} = Stitch.Accounts.Admin.update_user(user.id, %{profile_image_url: "https://foobar.com/image2.jpg"})
      assert user.profile_image_url == "https://foobar.com/image2.jpg"
    end

    test "it updates the username" do
      user = insert(:user, %{username: "sergiotapia"})
      {:ok, user} = Stitch.Accounts.Admin.update_user(user.id, %{username: "danieltapia"})
      assert user.username == "danieltapia"
    end

    test "it allows user to update to same username" do
      user = insert(:user, %{username: "sergiotapia"})
      {:ok, user} = Stitch.Accounts.Admin.update_user(user.id, %{username: "sergiotapia"})
      assert user.username == "sergiotapia"
    end

    test "it updates the pin" do
      user = insert(:user, %{pin: "1234"})
      {:ok, user} = Stitch.Accounts.Admin.update_user(user.id, %{pin: "4444"})
      assert user.pin == "4444"
    end

    test "it dissallows the same username within the same team" do
      team = insert(:team)
      _user = insert(:user, %{username: "sergiotapia", team_id: team.id})
      user2 = insert(:user, %{username: "danieltapia", team_id: team.id})
      {:error, changeset} = Stitch.Accounts.Admin.update_user(user2.id, %{username: "sergiotapia" })
      assert Enum.count(changeset.errors) == 1
    end

    test "it updates the email" do
      user = insert(:user, %{email: "sergiotapia@outlook.com"})
      {:ok, user} = Stitch.Accounts.Admin.update_user(user.id, %{email: "danieltapia@outlook.com" })
      assert user.email == "danieltapia@outlook.com"
    end

    test "it allows user to update to same email" do
      user = insert(:user, %{email: "sergiotapia@outlook.com"})
      {:ok, user} = Stitch.Accounts.Admin.update_user(user.id, %{email: "sergiotapia@outlook.com"})
      assert user.email == "sergiotapia@outlook.com"
    end

    test "it dissallows the same email within the same team" do
      team = insert(:team)
      _user = insert(:user, %{email: "sergiotapia@outlook.com", team_id: team.id})
      user2 = insert(:user, %{email: "danieltapia@outlook.com", team_id: team.id})
      {:error, changeset} = Stitch.Accounts.Admin.update_user(user2.id, %{email: "sergiotapia@outlook.com"})
      assert Enum.count(changeset.errors) == 1
    end
  end

  describe "change_role/3" do
    setup do
      team = insert(:team)
      group = insert(:group, team: team)

      member = insert(:user, team: team, roles: ["member"])
      single_room_guest = insert(:user, team: team, roles: ["single-room-guest"], groups_as_guest: [group.id])
      multi_room_guest = insert(:user, team: team, roles: ["multi-room-guest"], groups_as_guest: [group.id])
      {:ok, member: member, single_room_guest: single_room_guest, multi_room_guest: multi_room_guest, team: team}
    end

    test "changes a user's role to `member`", %{member: member, single_room_guest: srg, multi_room_guest: mrg} do
      role = "member"
      assert {:ok, %{roles: [^role], groups_as_guest: []}} = Stitch.Accounts.Admin.change_role(member, %{role: role})
      assert {:ok, %{roles: [^role], groups_as_guest: []}} = Stitch.Accounts.Admin.change_role(srg, %{role: role})
      assert {:ok, %{roles: [^role], groups_as_guest: []}} = Stitch.Accounts.Admin.change_role(mrg, %{role: role})
    end

    test "changes a user's role to `single-room-guest`", %{member: member, single_room_guest: srg, multi_room_guest: mrg, team: team} do
      role = "single-room-guest"
      group = insert(:group, team: team)
      group_id = group.id
      groups = [group_id]
      assert {:ok, %{roles: [^role], groups_as_guest: [^group_id]}} = Stitch.Accounts.Admin.change_role(member, %{role: role, groups_as_guest: groups})
      assert {:ok, %{roles: [^role], groups_as_guest: [^group_id]}} = Stitch.Accounts.Admin.change_role(srg, %{role: role, groups_as_guest: groups})
      assert {:ok, %{roles: [^role], groups_as_guest: [^group_id]}} = Stitch.Accounts.Admin.change_role(mrg, %{role: role, groups_as_guest: groups})
    end

    test "changes a user's role to `multi-room-guest`", %{member: member, single_room_guest: srg, multi_room_guest: mrg, team: team} do
      role = "multi-room-guest"
      group_ids =
        for _ <- 1..3 do
          group = insert(:group, team: team)
          group.id
        end
      assert {:ok, %{roles: [^role], groups_as_guest: ^group_ids}} = Stitch.Accounts.Admin.change_role(member, %{role: role, groups_as_guest: group_ids})
      assert {:ok, %{roles: [^role], groups_as_guest: ^group_ids}} = Stitch.Accounts.Admin.change_role(srg, %{role: role, groups_as_guest: group_ids})
      assert {:ok, %{roles: [^role], groups_as_guest: ^group_ids}} = Stitch.Accounts.Admin.change_role(mrg, %{role: role, groups_as_guest: group_ids})
    end

    test "`single-room-guest` and `multi-room-guest` validate group ids", %{member: member} do
      refute {:error, :invalid_group_ids} == Stitch.Accounts.Admin.change_role(member, %{role: "member", groups_as_guest: [-1]})
      assert {:error, :invalid_group_ids} == Stitch.Accounts.Admin.change_role(member, %{role: "single-room-guest", groups_as_guest: [-1]})
      assert {:error, :invalid_group_ids} == Stitch.Accounts.Admin.change_role(member, %{role: "multi-room-guest", groups_as_guest: [-1]})
    end

    test "`single-room-guest` requires exactly 1 group id", %{member: member, team: team} do
      role = "single-room-guest"
      group_ids =
        for _ <- 1..2 do
          group = insert(:group, team: team)
          group.id
        end
      assert {:error, :invalid_group_size} == Stitch.Accounts.Admin.change_role(member, %{role: role, groups_as_guest: []})
      assert {:error, :invalid_group_size} == Stitch.Accounts.Admin.change_role(member, %{role: role, groups_as_guest: group_ids})
    end

    test "`multi-room-guest` requires at least 1 group id", %{member: member, team: team} do
      role = "multi-room-guest"
      group_ids =
        for _ <- 1..2 do
          group = insert(:group, team: team)
          group.id
        end
      assert {:error, :invalid_group_size} == Stitch.Accounts.Admin.change_role(member, %{role: role, groups_as_guest: []})
      refute {:error, :invalid_group_size} == Stitch.Accounts.Admin.change_role(member, %{role: role, groups_as_guest: group_ids})
    end
  end

  describe "update_user_groups/1" do
    setup do
      team = insert(:team)
      user = insert(:user, team: team)
      group = insert(:group, team: team)
      insert(:group_user, group: group, user: user)
      {:ok, team: team, user: user, group: group}
    end

    test "does nothing when the user has the `admin`", %{team: team, group: group} do
      user = insert(:user, team: team, roles: ["admin"])
      insert(:group_user, group: group, user: user)
      assert {[], []} == Stitch.Accounts.Admin.update_user_groups(user)
      assert [group_user] = Stitch.GroupQueries.non_dm_group_memberships(user)
      assert group_user.group.id == group.id
    end

    test "adds user to team's default group if they aren't a member", %{team: team} do
      default_group = insert(:group, team: team, is_default: true)
      user = insert(:user, team: team, roles: ["member"])
      assert [] == Stitch.GroupQueries.non_dm_group_memberships(user)
      assert {[], [group]} = Stitch.Accounts.Admin.update_user_groups(user)
      assert group.id == default_group.id
      assert [group_user] = Stitch.GroupQueries.non_dm_group_memberships(user)
      assert group_user.group.id == default_group.id
      assert {[], []} == Stitch.Accounts.Admin.update_user_groups(user)
      assert [^group_user] = Stitch.GroupQueries.non_dm_group_memberships(user)
    end

    test "adds a guest to their restricted group when they aren't a member", %{group: group, team: team} do
      guest = insert(:user, team: team, roles: ["single-room-guest"], groups_as_guest: [group.id])
      assert {[], [added_group]} = Stitch.Accounts.Admin.update_user_groups(guest)
      assert added_group.id == group.id
      assert [group_user] = Stitch.GroupQueries.non_dm_group_memberships(guest)
      assert group_user.group.id == group.id
    end

    test "removes a guest from groups that aren't part of their restricted groups", %{team: team, group: group} do
      new_group = insert(:group, team: team)
      guest = insert(:user, team: team, roles: ["multi-room-guest"], groups_as_guest: [new_group.id])
      insert(:group_user, group: new_group, user: guest)
      insert(:group_user, group: group, user: guest)
      assert {[removed_group], []} = Stitch.Accounts.Admin.update_user_groups(guest)
      assert removed_group.id == group.id
      assert [group_user] = Stitch.GroupQueries.non_dm_group_memberships(guest)
      assert group_user.group.id == new_group.id
    end

    test "skips a restricted group a guest is already a member of", %{team: team, group: group} do
      guest = insert(:user, team: team, roles: ["single-room-guest"], groups_as_guest: [group.id])
      insert(:group_user, group: group, user: guest)
      assert {[], []} == Stitch.Accounts.Admin.update_user_groups(guest)
      assert [group_user] = Stitch.GroupQueries.non_dm_group_memberships(guest)
      assert group_user.group.id == group.id
    end
  end
end
