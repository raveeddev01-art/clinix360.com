defmodule Stitch.Accounts.Role do
  def admin(), do: ["admin"]
  def member(), do: ["member"]

  def multi_room_guest(), do: ["multi-room-guest"]
  def single_room_guest(), do: ["single-room-guest"]
  def guests(), do: multi_room_guest() ++ single_room_guest()

  def display_name("single-room-guest"), do: "Single Room Guest"
  def display_name("multi-room-guest"), do: "Multi Room Guest"
  def display_name("member"), do: "Full Member"
  def display_name("admin"), do: "Admin"
  def display_name(role), do: role
end
