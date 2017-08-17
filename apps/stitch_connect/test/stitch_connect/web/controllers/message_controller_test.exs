defmodule StitchConnect.Web.MessageControllerTest do
  use StitchConnect.Web.ConnCase, async: true
  import StitchConnect.Web.Router.Helpers
  import Stitch.Factory

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Stitch.Repo)
  end

  test "POST /api/v1/messages/:id/toggle-star", %{conn: conn} do
    user = insert(:user)
    message = insert(:message, user: user)
    team = message.group.team

    conn = conn
    |> subdomain(team.slug)
    |> post_as_user(user, "/api/v1/messages/#{message.id}/toggle-star")

    json = json_response(conn, 200)
    assert json["starred"] == true

    conn = conn
    |> recycle()
    |> subdomain(team.slug)
    |> post_as_user(user, "/api/v1/messages/#{message.id}/toggle-star")

    json = json_response(conn, 200)
    assert json["starred"] == false
  end

  test "POST /api/v1/messages/:id/toggle-pin", %{conn: conn} do
    user = insert(:user)
    message = insert(:message, user: user)
    team = message.group.team

    conn = conn
    |> subdomain(team.slug)
    |> post_as_user(user, "/api/v1/messages/#{message.id}/toggle-pin")

    json = json_response(conn, 200)
    assert json["pinned"] == true
    assert json["pinned_by"]["id"] == user.id
    assert json["pinned_at"] != nil

    conn = conn
    |> recycle()
    |> subdomain(team.slug)
    |> post_as_user(user, "/api/v1/messages/#{message.id}/toggle-pin")

    json = json_response(conn, 200)
    assert json["pinned"] == false
    assert json["pinned_by"] == nil
    assert json["pinned_at"] == nil
  end
end
