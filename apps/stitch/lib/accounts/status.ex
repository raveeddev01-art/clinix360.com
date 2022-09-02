defmodule Stitch.Accounts.Status do
  @moduledoc """
  The User schema module.
  """
  use Ecto.Schema
  import Ecto.Changeset
  alias Stitch.Accounts.User
  alias Stitch.{Repo, Accounts.ProfileImage, GroupUser}
  schema "status" do

    ###### add status with time ###########
    field(:text, :string)
    field(:emoji, :string)
    field(:time, :utc_datetime)
    field(:history, {:array, :string}, default: [])
    # belongs_to(:user, User)
    field :user_id, :id
    #################

    timestamps()
  end

  def changeset(struct, attrs) do
    struct
    |> cast(attrs, [:text, :emoji, :time, :history])
    |> validate_required([:text, :emoji, :time, :history])
  end

end
