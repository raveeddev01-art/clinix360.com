defmodule Stitch.Team.AdminTest do
  use ExUnit.Case, async: true
  import Stitch.Factory
  alias Stitch.Team.Admin

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  describe "Stitch.Team.Admin.update_name/2" do
    test "updates name and returns OK and team struct" do
      team = insert(:team, %{name: "abc"})
      {:ok, new_team} = Admin.update_name(team.id, "def")
      assert new_team.name == "def"
    end

    test "returns error for nil and empty names" do
      team = insert(:team, %{name: "abc"})
      {:error, reason} = Admin.update_name(team.id, nil)
      assert reason == "Name cannot be blank or nil"

      {:error, reason} = Admin.update_name(team.id, "")
      assert reason == "Name cannot be blank or nil"
    end
  end

  describe "Stitch.Team.Admin.update_contact_info/2" do
    test "updates contact info and returns OK and team struct" do
      team = insert(:team, %{name: "abc"})
      params = %{
        "name" => "My Name",
        "city" => "My City",
        "state" => "CA",
        "country" => "USA",
        "zip_code" => "55555-3333",
        "company_name" => "My Test Company",
        "address_line_one" => "Street 123, chapel road"
      }

      {:ok, new_team} = Admin.update_contact_info(team, params)
      assert new_team.name == params["name"]
      assert new_team.city == params["city"]
      assert new_team.state == params["state"]
      assert new_team.country == params["country"]
      assert new_team.zip_code == params["zip_code"]
      assert new_team.company_name == params["company_name"]
      assert new_team.address_line_one == params["address_line_one"]
    end

    test "validate required fields" do
      team = insert(:team, %{name: "abc"})
      params = %{
        "city" => "",
        "state" => "",
        "country" => "",
        "zip_code" => "",
        "company_name" => "",
        "address_line_one" => ""
      }

      {:error, %Ecto.Changeset{errors: errors}} = Admin.update_contact_info(team, params)

      assert [
        company_name: {"can't be blank", [validation: :required]},
        address_line_one: {"can't be blank", [validation: :required]},
        city: {"can't be blank", [validation: :required]},
        state: {"can't be blank", [validation: :required]},
        country: {"can't be blank", [validation: :required]},
        zip_code: {"can't be blank", [validation: :required]}
      ] = errors
    end

    test "validate country name and zip_code format" do
      team = insert(:team, %{name: "abc"})
      params = %{
        "name" => "My Name",
        "city" => "My City",
        "state" => "CA",
        "country" => "XYZ",
        "zip_code" => "XXXXX-YYYY",
        "company_name" => "My Test Company",
        "address_line_one" => "Street 123, chapel road"
      }

      {:error, %Ecto.Changeset{errors: errors}} = Admin.update_contact_info(team, params)
      assert [
        zip_code: {"has invalid format", [validation: :format]},
        country: {"is invalid.", []}
      ] = errors
    end
  end

  describe "Stitch.Team.Admin.update_security_lockout_time/3" do
    test "updates security_lockout and seconds_to_lockout for team" do
      team = insert(:team, %{name: "abc"})
      {:ok, new_team} = Admin.update_security_lockout_time(team.id, true, 200)
      assert new_team.security_lockout == true
      assert new_team.seconds_to_lockout == 200
    end
  end

  describe "Stitch.Team.Admin.update_security_lockout_time/2" do
    test "updates security_lockout for team" do
      team = insert(:team, %{name: "abc"})
      {:ok, new_team} = Admin.update_security_lockout_time(team.id, false)
      assert new_team.security_lockout == false
      assert new_team.seconds_to_lockout == 99
    end
  end

  describe "Stitch.Team.Admin.update_open_invitation/2" do
    test "updates open_invitations_enabled for team" do
      team = insert(:team, %{name: "abc"})
      {:ok, new_team} = Admin.update_open_invitation(team.id, true)
      assert new_team.open_invitations_enabled == true
    end
  end
end
