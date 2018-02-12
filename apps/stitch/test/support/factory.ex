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
      text_content: Faker.Lorem.sentence,
      type: "chat"
    }
  end

  def export_factory do
    %Stitch.Exports.Export{
      team: build(:team),
    }
  end

  def mobile_device_factory do
    %Stitch.Mobile.Device{
      user: build(:user),
      name: Faker.Lorem.words |> Enum.join(" "),
      type: Enum.random(["ios", "android"]),
      token: Faker.String.base64
    }
  end

  def subscription_factory do
    end_date = Timex.shift(DateTime.utc_now(), days: 30)
    %Stitch.Billing.Subscription{
      team: build(:team),
      customer_id: sequence(:customer_id, &"cus_#{&1}"),
      subscription_id: sequence(:subscription_id, &"sub_#{&1}"),
      subscription_line_item_id: sequence(:subscription_line_item_id, &"si_#{&1}"),
      estimated_invoice_amount: 12_345,
      tier: "BASIC",
      renewal_frequency: "MONTHLY",
      renews: true,
      valid_until: end_date,
      trial_valid_until: DateTime.utc_now()
    }
  end

  def trial_subscription_factory do
    end_date = Timex.shift(DateTime.utc_now(), days: 14)
    %Stitch.Billing.Subscription{
      team: build(:team),
      customer_id: sequence(:customer_id, &"cus_#{&1}"),
      subscription_id: nil,
      subscription_line_item_id: nil,
      estimated_invoice_amount: 0,
      tier: "TRIAL",
      renewal_frequency: nil,
      valid_until: end_date,
      trial_valid_until: end_date
    }
  end

  def card_factory do
    timestamp = DateTime.utc_now() |> DateTime.to_unix()
    %Stitch.Billing.PaymentMethod{
      team: build(:team),
      card_id: "card_#{timestamp}",
      brand: "Visa",
      last_four: "4242",
      exp_month: Enum.random(1..12),
      exp_year: Enum.random(2020..2025),
      cardholder_name: "John Doe"
    }
  end

  def payment_history_factory do
    %Stitch.Billing.PaymentHistory{
      plan: "basic_yearly",
      team: build(:team),
      invoice_id: "inv_xxxxxxxxxxxy",
      amount: 12000,
      quantity: 5,
      period_end: NaiveDateTime.utc_now(),
      period_start: NaiveDateTime.utc_now()
    }
  end

  def find_your_team_token_factory do
    %Stitch.FindYourTeam.Token{
      type: "login",
      token: Stitch.Rand.token(32),
      email: sequence(:email, &"email-#{&1}@example.com"),
    }
  end
end
