defmodule Stitch.Factory do
  use ExMachina.Ecto, repo: Stitch.Repo
  
  def user_factory do
    %Stitch.User{
      fullname: "Sergio Tapia",
      email: sequence(:email, &"email-#{&1}@example.com")
    }
  end
end