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

  def changeset(attrs) do
    %UserStatus{}
    |> cast(attrs, [:user_id, :text, :emoji, :expiring_time])
    |> validate_required([:user_id])
  end

  def clear_user_status_changeset(struct, attrs) do
    struct
    |> cast(attrs, [:user_id, :active])
    |> validate_required([:user_id, :active])
  end

  def clear_status(struct) do
    struct
    |> clear_user_status_changeset(%{active: false})
    |> Repo.update()
  end

  def clear_user_status(user_id) do
    user_status(user_id)
    |> case do
      nil -> {:ok, last_active_status(user_id)}
      status -> clear_status(status)
    end
  end

  def save_user_status(params) do
    params
    |> validate_expiring_time()
    |> IO.inspect(label: "validations")
    |> changeset()
    |> IO.inspect(label: "changeset")
    |> Repo.insert()
    |> activate_new_status()
  end

  def user_status(user_id) do
    from(
      s in UserStatus,
      where: s.user_id == ^user_id,
      where: s.active == true
    )
    |> Repo.one()
  end

  def last_active_status(user_id) do
    UserStatus
    |> where([s], s.user_id == ^user_id)
    |> last(:updated_at)
    |> Repo.one()
  end

  def user_status_history(user_id) do
    from(
      s in UserStatus,
      where: s.user_id == ^user_id,
      order_by: fragment("? DESC", s.updated_at),
      limit: 5
    )
    |> Repo.all()
  end

  def clear_expired_status() do
    from(
      s in UserStatus,
      where: s.active == true,
      where: s.expiring_time < ^DateTime.utc_now(),
      update: [set: [active: false]]
    )
    |> Repo.update_all([])
  end

  defp activate_new_status({:ok, status}) do
    from(
      s in UserStatus,
      where: s.user_id == ^status.user_id,
      where: s.id != ^status.id,
      update: [set: [active: false]]
    )
    |> Repo.update_all([])

    {:ok, user_status(status.user_id)}
  end

  defp validate_expiring_time(%{"clear_after" => clear_after} = params) do
    case clear_after do
      0 -> Map.delete(params, "expiring_time")
      6 -> Map.put(params, "expiring_time", params["custom_time"])
      _ -> Map.put(params, "expiring_time", params |> expiring_time())
    end
  end

  defp expiring_time(%{"clear_after" => 1}), do: Timex.now() |> Timex.shift(hours: 0, minutes: 30)
  defp expiring_time(%{"clear_after" => 2}), do: Timex.now() |> Timex.shift(hours: 1, minutes: 0)
  defp expiring_time(%{"clear_after" => 3}), do: Timex.now() |> Timex.shift(hours: 4, minutes: 0)
  defp expiring_time(%{"clear_after" => 4}), do: Timex.now() |> Timex.end_of_day()
  defp expiring_time(%{"clear_after" => 5}), do: Timex.now() |> Timex.end_of_week()
end
