defmodule Stitch.News do
  use Ecto.Schema
  import Ecto.Changeset
  alias Stitch.Repo
  alias Stitch.{News}

  @type t :: %__MODULE__{}

  schema "news" do
    field(:title, :string)
    field(:html_body, :string)
    field(:permalink, :string)
    timestamps()
  end

  def changeset(%Stitch.News{} = struct, params) do
    struct
    |> cast(params, [:title, :html_body, :permalink])
    |> validate_required([:title, :html_body])
    |> unique_constraint(
      :permalink,
      name: :news_permalink_unique_index,
      message: "has already been taken"
    )
  end

  @doc """
  Create a new News story to be displayed in the Stitch application.
  """
  @spec create(map) :: {:ok, News.t()} | {:error, Ecto.Changeset.t()}
  def create(news_params) do
    news = %News{}
    changeset = changeset(news, news_params)
    Repo.insert(changeset)
  end

  @doc """
  Updates the whats_new_last_seen_at field for the user to
  the current unix time.
  """
  def mark_user_as_read(user) do
    Ecto.Changeset.change(user, %{whats_new_last_seen_at: DateTime.utc_now()})
    |> Repo.update()
  end
end
