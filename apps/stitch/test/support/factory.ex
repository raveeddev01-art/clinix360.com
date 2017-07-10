defmodule Stitch.Factory do
  use ExMachina.Ecto, repo: Stitch.Repo

  def user_factory do
    %Stitch.User{
      fullname: "Sergio Tapia",
      email: sequence(:email, &"email-#{&1}@example.com")
    }
  end

  def team_factory do
    %Stitch.Team{
      name: "Starbucks",
      slug: "starbucks"
    }
  end

  def room_factory do
    %Stitch.Room{
      name: "General"
    }
  end
end