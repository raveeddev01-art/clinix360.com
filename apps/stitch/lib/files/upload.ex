defmodule Stitch.Files.Upload do
  alias Stitch.{
    Accounts.User,
    Files.Upload,
    Files.GroupUpload,
    Rand,
    Repo,
    Team,
    Group
  }

  use Ecto.Schema
  import Ecto.Changeset

  @type t :: %__MODULE__{}

  schema "uploads" do
    belongs_to(:user, User)
    belongs_to(:team, Team)
    field(:filename, :string)
    field(:url, :string)
    field(:mimetype, :string, default: "application/octet-stream")
    field(:filetype, :string, default: "binary")
    field(:size_in_bytes, :integer)
    field(:preview_height, :integer)
    field(:preview_width, :integer)
    field(:preview_url, :string)
    field(:shared_in, {:array, :integer}, virtual: true)

    timestamps()
  end

  @spec new(Upload.t(), map) :: Ecto.Changeset.t()
  def new(%Upload{} = struct, attrs) do
    struct
    |> cast(attrs, [
      :filename,
      :url,
      :mimetype,
      :filetype,
      :size_in_bytes,
      :preview_height,
      :preview_width,
      :preview_url
    ])
    |> validate_required([:url])
    |> put_default_name()
    |> put_filetype()
  end

  @spec create(User.t(), map) :: {:ok, Upload.t()} | {:error, Ecto.Changeset.t()}
  def create(%User{} = user, attrs) do
    %Upload{user_id: user.id, team_id: user.team_id}
    |> new(attrs)
    |> Repo.insert()
  end

  @spec share_with_group(Upload.t(), Group.t()) ::
          {:ok, GroupUpload.t()} | {:error, Ecto.Changeset.t()}
  def share_with_group(%Upload{} = file, %Group{} = group) do
    GroupUpload.create(group, file)
  end

  @spec unshare_from_group(Upload.t(), Group.t()) :: {:ok, GroupUpload.t()} | :error
  def unshare_from_group(%Upload{} = file, %Group{} = group) do
    GroupUpload.delete(group, file)
  end

  def create_and_share_with_group(%Group{} = group, %User{} = user, attrs) do
    with {:ok, file} <- create(user, attrs),
         {:ok, group_file} <- share_with_group(file, group) do
      {:ok, file, group_file}
    else
      error -> {:error, error}
    end
  end

  defp put_default_name(%Ecto.Changeset{changes: %{filename: filename}} = changeset)
       when not is_nil(filename) and filename != "",
       do: changeset

  defp put_default_name(changeset) do
    value = String.downcase(Rand.token(32))
    put_change(changeset, :filename, value)
  end

  def put_filetype(%Ecto.Changeset{changes: %{filetype: filetype}} = changeset)
      when not is_nil(filetype) and filetype != "",
      do: changeset

  def put_filetype(%Ecto.Changeset{changes: %{mimetype: mimetype}} = changeset) do
    case String.split(mimetype, "/") do
      ["application", "*"] ->
        put_change(changeset, :filetype, "binary")

      ["application", "octet-stream"] ->
        put_change(changeset, :filetype, "binary")

      [type, "*"] ->
        put_change(changeset, :filetype, type)

      [_type, "jpg"] ->
        put_change(changeset, :filetype, "jped")

      [_type, subtype] ->
        put_change(changeset, :filetype, subtype)

      _ ->
        changeset
    end
  end

  def put_filetype(changeset), do: changeset

  @spec encode_url_id(Upload.t()) :: String.t()
  def encode_url_id(%Upload{} = file) do
    "f" <> Base.encode32("#{file.id}", case: :lower, padding: false)
  end

  @spec decode_url_id(String.t()) :: {:ok, integer} | :error
  def decode_url_id("f" <> file_id) do
    with {:ok, string_id} <- Base.decode32("#{file_id}", case: :lower, padding: false),
         {int_id, _} <- Integer.parse(string_id) do
      {:ok, int_id}
    else
      _ -> :error
    end
  end
end
