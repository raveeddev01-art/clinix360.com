defmodule Stitch.Accounts.UserStatus do
  @moduledoc """
  The User Status schema module.
  """
  use Ecto.Schema
  import Ecto.Query
  import Ecto.Changeset
  alias Ecto.Multi
  alias Stitch.{Repo, Accounts.UserStatus, Accounts.User}

  schema "user_status" do
    field(:text, :string)
    field(:emoji, :string)
    field(:expiring_time, :utc_datetime)
    field(:user_id, :integer)
    field(:active, :boolean)
    field(:clear_after, :integer)
    timestamps()
  end

  def changeset(attrs) do
    %UserStatus{}
    |> cast(attrs, [:user_id, :text, :emoji, :expiring_time, :clear_after])
    |> validate_required([:user_id])
  end

  def clear_user_status(user_id) do
    clear_status(user_id)
  end

  def delete_status(status_id) do
    status = Repo.get(UserStatus, status_id)

    from(s in UserStatus,
      where: s.user_id == ^status.user_id,
      where: s.text == ^status.text,
      where: s.emoji == ^status.emoji
    )
    |> Repo.delete_all()
  end

  def save_user_status(params) do
    params
    |> validate_expiring_time()
    |> changeset()
    |> Repo.insert()
    |> activate_new_status()
  end

  def user_status(user_id) do
    from(
      s in UserStatus,
      where: s.user_id == ^user_id,
      where: s.active == true,
      order_by: fragment("? DESC", s.inserted_at),
      limit: 1
    )
    |> Repo.one()
  end

  def user_status_history(user_id) do
    from(
      s in UserStatus,
      where: s.user_id == ^user_id,
      distinct: [desc: s.text, desc: s.emoji],
      order_by: fragment("? DESC", s.text),
      limit: 5
    )
    |> Repo.all()
  end

  def users_with_expired_status() do
    from(
      s in UserStatus,
      where: s.active == true,
      where: s.expiring_time < ^DateTime.utc_now(),
      select: s.user_id
    )
    |> Repo.all()
  end

  defp decativate_last_status_query(status) do
    from(
      s in UserStatus,
      where: s.user_id == ^status.user_id,
      where: s.id != ^status.id,
      update: [set: [active: false, updated_at: ^updated_at()]]
    )
  end

  defp decativate_current_status_query(user_id) do
    from(
      s in UserStatus,
      where: s.user_id == ^user_id,
      update: [set: [active: false, updated_at: ^updated_at()]]
    )
  end

  defp remove_status_from_user_query(user_id) do
    from(
      u in User,
      where: u.id == ^user_id,
      update: [
        set: [
          status_fields: ^%{}
        ]
      ]
    )
  end

  defp update_status_in_user_query(status) do
    status = user_status(status.user_id)

    from(
      u in User,
      where: u.id == ^status.user_id,
      update: [
        set: [
          status_fields:
            ^%{
              text: status.text,
              emoji: status.emoji,
              active: status.active,
              expiring_time: status.expiring_time,
              clear_after: status.clear_after
            }
        ]
      ]
    )
  end

  defp activate_new_status({:ok, status}) do
    deactivate_status_query = decativate_last_status_query(status)
    add_user_status_query = update_status_in_user_query(status)

    Multi.new()
    |> Multi.update_all(:disable_previous_status, deactivate_status_query, [])
    |> Multi.update_all(:add_status_in_user, add_user_status_query, [], returning: true)
    |> Repo.transaction()

    {:ok, user_status(status.user_id)}
  end

  defp clear_status(user_id) do
    deactivate_status_query = decativate_current_status_query(user_id)
    remove_user_status_query = remove_status_from_user_query(user_id)

    Multi.new()
    |> Multi.update_all(:disable_status, deactivate_status_query, [])
    |> Multi.update_all(:clear_status_in_user, remove_user_status_query, [])
    |> Repo.transaction()
  end

  defp validate_expiring_time(%{"clear_after" => clear_after} = params) do
    case clear_after do
      0 -> Map.delete(params, "expiring_time")
      6 -> Map.put(params, "expiring_time", params["custom_time"])
      _ -> Map.put(params, "expiring_time", params |> expiring_time())
    end
    |> Map.delete("custom_time")
  end

  defp expiring_time(%{"clear_after" => 1}), do: Timex.now() |> Timex.shift(hours: 0, minutes: 30)
  defp expiring_time(%{"clear_after" => 2}), do: Timex.now() |> Timex.shift(hours: 1, minutes: 0)
  defp expiring_time(%{"clear_after" => 3}), do: Timex.now() |> Timex.shift(hours: 4, minutes: 0)
  defp expiring_time(%{"clear_after" => 4}), do: Timex.now() |> Timex.end_of_day()
  defp expiring_time(%{"clear_after" => 5}), do: Timex.now() |> Timex.end_of_week()

  defp updated_at(), do: DateTime.utc_now() |> DateTime.to_naive()
end
