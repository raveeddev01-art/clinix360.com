defmodule Stitch.UserQueries do
  import Ecto.Query
  alias Stitch.{Repo, User}

  def get_all do
    Repo.all(from User)
  end

  def get_by_id(id) when is_integer(id) and id < 1 do
    {:error, "Id cannot be less than 1."}
  end

  def get_by_id(id) when is_integer(id) do
    case Repo.get(User, id) do
      nil -> {:not_found, "User with id #{id} was not found."}
      record -> record
    end
  end

  def get_by_id(_) do {:error, "Id isn't an integer."} end
end