defmodule Stitch.Factory do
  use ExMachina.Ecto, repo: Stitch.Repo

  def user_factory do
    %Stitch.Accounts.User{
      first_name: "Sergio",
      last_name: "Tapia",
      email: sequence(:email, &"email-#{&1}@example.com"),
      phone_number: "1231231234",
      roles: ["member"],
      onboarded: true,
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
    %Stitch.Group{
      name: "Onboarding",
      slug: "onboarding",
      description: "Group used to onboard new users to team procedures.",
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

  def group_notification_preference_factory do
    %Stitch.GroupNotificationPreference{
      user: build(:user),
      group: build(:group),
      setting: "mentions"
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
