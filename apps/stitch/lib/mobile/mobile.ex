defmodule Stitch.Mobile do
  import Ecto.Query
  alias Stitch.{Accounts.User, Mobile.Device, Repo}

  def list_user_devices(user_id) do
    from(d in Device, where: d.user_id == ^user_id)
    |> Repo.all
  end

  def register_device(%User{id: user_id}, attrs) do
    %Device{user_id: user_id}
    |> Device.changeset(attrs)
    |> Repo.insert
  end
end
