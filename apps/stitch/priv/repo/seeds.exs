alias Stitch.Repo
alias Stitch.Accounts.User
alias Stitch.{Team, Group}

Repo.insert! %Team{
  name: "Care Clinic",
  slug: "care-clinic",
  open_invitations_enabled: true
}
