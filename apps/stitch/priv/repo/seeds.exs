alias Stitch.Repo
alias Stitch.Accounts.User
alias Stitch.{Team, Group, Accounts}

team = Repo.insert! %Team{
  name: "Care Clinic",
  slug: "care-clinic",
  open_invitations_enabled: true
}

case Accounts.create_and_complete_user_onboarding(%{
  email: "boss@example.com",
  password: "Somepass1234!",
  first_name: "The",
  last_name: "Bossman",
  username: "bossman",
  pin: "0000",
  roles: ["admin"],
  team_id: team.id
}) do
  {:error, reason} ->
    IO.puts "zomg error creating user: #{reason}"
  user ->
    IO.puts "created user #{user.username}"
    case Group.create(%{"name" => "General", "slug" => "general", "public" => true}, team.id, user.id) do
      {:error, reason} ->
        IO.puts "error creating group: #{reason}"
      {:ok, group} ->
        IO.puts "created group #{group.slug}"
    end
end
