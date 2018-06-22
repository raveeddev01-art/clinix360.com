defmodule Stitch.Files.FileAuthorization do
  alias Stitch.{
    Files.Upload,
    Accounts.User,
    GroupUser
  }

  @spec can_view?(Upload.t(), User.t()) :: boolean
  def can_view?(%Upload{user_id: user_id}, %User{id: user_id}), do: true

  def can_view?(%Upload{team_id: team_id, public: true}, %User{team_id: team_id}), do: true

  def can_view?(%Upload{team_id: team_id} = upload, %User{team_id: team_id} = user) do
    GroupUser.is_member_in_groups(upload.shared_in, user.id)
  end

  def can_view?(_group, _user), do: false

  @spec is_creator?(Upload.t(), User.t()) :: boolean
  def is_creator?(%Upload{team_id: team_id, public: true}, %User{team_id: team_id}), do: true

  def is_creator?(_upload, _user), do: false
end
