defmodule Stitch.Factory do
  use ExMachina.Ecto, repo: Stitch.Repo

  @password_hash Stitch.User.Authentication.hash_password("password")

  def user_factory do
    %Stitch.Accounts.User{
      first_name: "Sergio",
      last_name: "Tapia",
      email: sequence(:email, &"email-#{&1}@example.com"),
      phone_number: "1231231234",
      roles: ["member"],
      onboarded: true,
      password_hash: @password_hash,
      token: sequence(:token, &"ezkLsxjGxnyU_mgcHepbliFeX1#{&1 |> Integer.to_string |> String.pad_leading(5, "0")}-")
    }
  end

  def team_factory do
    random_id = sequence("team")
    %Stitch.Team{
      name: "Starbucks-#{random_id}",
      slug: "starbucks-#{random_id}",
      security_lockout: true,
      seconds_to_lockout: 99,
      open_invitations_enabled: false
    }
  end

  def group_factory do
    name = Faker.Commerce.department

    %Stitch.Group{
      name: name,
      slug: sequence(:group_slug, &"#{Slugger.slugify_downcase(name)}-#{&1}"),
      description: Faker.Company.bs,
      public: true,
      team: build(:team),
      creator: build(:user)
    }
  end

  def group_user_factory do
    %Stitch.GroupUser{
      user: build(:user),
      group: build(:group)
    }
  end

  def invitation_factory do
    %Stitch.Invitation{
      invite_token: "abc",
      accepted: false
    }
  end

  def message_factory do
    %Stitch.Message{
      user: build(:user),
      group: build(:group),
      text_content: "lorem ipsum"
    }
  end
end
