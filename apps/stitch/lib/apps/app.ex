defmodule Stitch.App do
  use Ecto.Schema
  import Ecto.Changeset
  alias Stitch.Repo
  alias Stitch.{App}

  @type t :: %__MODULE__{}

  schema "apps" do
    field(:name, :string)
    field(:slug, :string)
    field(:description, :string)
    field(:icon_url, :string)
    timestamps()
  end

  def changeset(%Stitch.App{} = struct, params) do
    struct
    |> cast(params, [:name, :slug, :description, :icon_url])
    |> slugify_name()
    |> validate_required([:name, :slug, :description, :icon_url])
    |> validate_length(:name, max: 25)
    |> validate_format(:name, ~r/^[\w-\s]+$/)
    |> unique_constraint(:name, name: :apps_name_unique_index, message: "has already been taken")
    |> unique_constraint(:slug, name: :apps_slug_unique_index, message: "has already been taken")
  end

  # If slug is already set, return changeset.
  defp slugify_name(%Ecto.Changeset{changes: %{slug: _}} = changeset), do: changeset

  # When name isn't nil, perform slugification of name.
  defp slugify_name(%Ecto.Changeset{changes: %{name: name}} = changeset) when not is_nil(name) do
    slug = Slugger.slugify_downcase(name)
    Ecto.Changeset.put_change(changeset, :slug, slug)
  end

  # Just return the changeset.
  defp slugify_name(%Ecto.Changeset{} = changeset), do: changeset

  @doc """
  Create a new App that can be used in Stitch.
  """
  @spec create(map) :: {:ok, App.t()} | {:error, Ecto.Changeset.t()}
  def create(app_params) do
    app = %App{}
    changeset = changeset(app, app_params)
    Repo.insert(changeset)
  end
end
