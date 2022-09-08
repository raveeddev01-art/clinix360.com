defmodule Stitch.Accounts.UserStatus do
  @moduledoc """
  The User Status schema module.
  """
  use Ecto.Schema
  import Ecto.Query
  import Ecto.Changeset
  alias Stitch.{Repo, Accounts.UserStatus}

  schema "user_status" do
    field(:text, :string)
    field(:emoji, :string)
    field(:expiring_time, :utc_datetime)
    field(:user_id, :integer)
    field(:active, :boolean)
    timestamps()
  end

  def changeset(struct, attrs) do
    struct
    |> cast(attrs, [:user_id, :text, :emoji, :expiring_time])
    |> validate_required([:user_id, :expiring_time])
  end

  def clear_user_status_changeset(struct, attrs) do
    struct
    |> cast(attrs, [:active])
    |> validate_required([:active])
  end

  # def cast_date(%{"expiring_time" => date_string} = params) do
  #   IO.inspect(date_string)
  #   # "Sat Aug 04 11:48:27 +0000 2012"
  #   # "Thu Sep 08 2022 07:00:00 GMT+0000"
  #   date_string
  #   |> Timex.parse!("%a %b %d %Y %T %Z", :strftime)
  #   |> Ecto.DateTime.utc()
  #   |> IO.inspect(label: "casting done")
  #   {:ok, dt_struct, _utc_offset} = DateTime.from_iso8601(date_string)
  #   Map.replace(params, "expiring_time", dt_struct)
  # end

  "Thu Sep 08 2022 07:00:00 GMT+0000"
  def clear_status(nil), do: nil
  def clear_status(struct) do
    struct
    |> clear_user_status_changeset(%{active: false})
    |> IO.inspect(label: "clear status chageset")
    |> Repo.update()
    |> IO.inspect(label: "status updated")
  end

  def clear_user_status(user_id) do
    user_status(user_id)
    |> IO.inspect(label: "user status to clear")
    |> clear_status()
  end

  def set_user_status(%{"user_id" => user_id} = params) do
    clear_user_status(user_id)
    |> IO.inspect(label: "user status cleared")

    %UserStatus{}
    |> changeset(params)
    |> IO.inspect(label: "chageset")
    |> Repo.insert()
    |> IO.inspect(label: "inserted")
  end

  def user_status(user_id) do
    from(
      s in UserStatus,
      where: s.user_id == ^user_id,
      where: s.active == true
    )
    |> Repo.one()
  end

  def user_status_history(user_id) do
    from(
      s in UserStatus,
      where: s.user_id == ^user_id,
      limit: 5
    )
    |> Repo.all()
  end

  def clear_expired_status() do
    clear_expired_statuses_query()
    |> Repo.update_all([])
  end

  def clear_expired_statuses_query() do
    from(
      s in UserStatus,
      where: s.active == true,
      where: s.expiring_time < ^DateTime.utc_now(),
      update: [set: [active: false]]
    )
  end

end
