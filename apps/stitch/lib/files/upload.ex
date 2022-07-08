defmodule Stitch.Files.Upload do
  alias Stitch.{
    Accounts.User,
    Files.Upload,
    Files.EngageUpload,
    # Files.UploadComment,
    Files.GroupUpload,
    Files.Thumb,
    Message,
    Rand,
    Repo,
    Team,
    Group
  }

  use Ecto.Schema
  import Ecto.Query
  import Ecto.Changeset
  alias Ecto.Multi

  @type t :: %__MODULE__{}

  schema "uploads" do
    belongs_to(:user, User)
    belongs_to(:team, Team)
    has_many(:group_uploads, GroupUpload)
    # has_many(:upload_comments, UploadComment)
    # belongs_to(:messages, Message)
    has_many(:groups, through: [:group_uploads, :groups])
    field(:filename, :string)
    field(:url, :string)
    field(:mimetype, :string, default: "application/octet-stream")
    field(:filetype, :string, default: "binary")
    field(:size_in_bytes, :integer)
    field(:preview_height, :integer)
    field(:preview_width, :integer)
    field(:preview_url, :string)
    field(:public, :boolean, default: true)
    field(:public_token, :string)
    field(:shared_in, {:array, :integer}, virtual: true, default: [])
    field(:starred, :boolean, virtual: true, default: false)
    field(:comment_count, :integer)

    timestamps()
  end

  @attributes [
    :filename,
    :url,
    :public,
    :mimetype,
    :filetype,
    :size_in_bytes,
    :preview_height,
    :preview_width,
    :preview_url,
    :id
  ]

  @spec new(Upload.t(), map) :: Ecto.Changeset.t()
  def new(%Upload{} = struct, attrs) do
    struct
    |> cast(attrs, @attributes)
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
  def share_with_group(%Upload{} = upload, %Group{public: true} = group) do
    with {:ok, upload} <- make_public(upload) do
      GroupUpload.create(group, upload)
    else
      error -> error
    end
  end

  def share_with_group(%Upload{} = upload, %Group{} = group) do
    GroupUpload.create(group, upload)
  end

  @spec unshare_from_group(Upload.t(), Group.t()) :: {:ok, GroupUpload.t()} | :error
  def unshare_from_group(%Upload{} = upload, %Group{} = group) do
    GroupUpload.delete(group, upload)
  end

  def create_and_share_with_group(%Group{} = group, %User{} = user, attrs)
      when is_list(attrs) do
    {:ok,
     Enum.map(attrs, fn attr ->
       {:ok, upload, _} = create_and_share_with_group(group, user, attr)
       upload
     end)}
  end

  def create_and_share_with_group(%Group{} = group, %User{} = user, attrs, _opts \\ []) do
    with attrs = Map.put(attrs, "public", group.public),
         {:ok, upload} <- create(user, attrs),
         {:ok, group_file} <- share_with_group(upload, group) do
      {:ok, upload, group_file}
    else
      error -> {:error, error}
    end
  end

  @spec make_public(Upload.t()) :: {:ok, Upload.t()} | {:error, Ecto.Changeset.t()}
  def make_public(%Upload{} = upload) do
    upload
    |> change(public: true)
    |> Repo.update()
  end

  def put_default_name(%Ecto.Changeset{changes: %{filename: filename}} = changeset)
      when not is_nil(filename) and filename != "",
      do: changeset

  def put_default_name(changeset) do
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
        put_change(changeset, :filetype, "jpeg")

      [_type, subtype] ->
        put_change(changeset, :filetype, subtype)

      _ ->
        changeset
    end
  end

  def put_filetype(changeset), do: changeset

  def create_previews(fields, opts \\ []) do
    Enum.map(fields, fn field ->
      create_preview(field, opts)
      |> case do
        {:ok, preview} ->
          %Upload{id: field["id"]}
          |> update_preview_fields(preview)

          field
          |> Map.replace("preview_height", preview.preview_height)
          |> Map.replace("preview_width", preview.preview_width)
          |> Map.replace("preview_url", preview.preview_url)

        {:error, _} ->
          field
      end
    end)
  end

  def create_preview(_attrs, with_preview: false), do: {:ok, %{}}

  def create_preview(fields, _opts) do
    case Thumb.create(fields) do
      {:ok, preview_metadata} ->
        {:ok, preview_metadata}

      {:error, "Unsupported type"} ->
        {:error, %{}}

      {:error, error} ->
        {:error, error}
    end
  end

  @spec encode_url_id(Upload.t()) :: String.t()
  def encode_url_id(%Upload{} = upload) do
    "f" <> Base.encode32("#{upload.id}", case: :lower, padding: false)
  end

  @spec decode_url_id(String.t()) :: {:ok, integer} | :error
  def decode_url_id("f" <> upload_id) do
    with {:ok, string_id} <- Base.decode32("#{upload_id}", case: :lower, padding: false),
         {int_id, _} <- Integer.parse(string_id) do
      {:ok, int_id}
    else
      _ -> :error
    end
  end

  @spec has_preview?(Upload.t() | EngageUpload.t()) :: boolean
  def has_preview?(upload) do
    !!(upload.preview_height && upload.preview_width && upload.preview_url)
  end

  @spec fields(Upload.t() | list()) :: map
  def fields(uploads) when is_list(uploads) do
    Enum.map(uploads, fn upload ->
      fields(upload)
    end)
  end

  def fields(%Upload{} = upload) do
    upload
    |> Map.take(@attributes ++ [:comment_count, :public_token])
    |> Map.new(fn {k, v} -> {"#{k}", v} end)
    |> Map.put("encoded_id", encode_url_id(upload))
  end

  @spec has_public_token?(Upload.t()) :: boolean
  def has_public_token?(%Upload{} = upload) do
    !!upload.public_token
  end

  def update_preview_fields(%Upload{} = struct, attrs) do
    change(struct, attrs)
    |> Repo.update()
  end

  @spec create_public_link(Upload.t()) :: {:ok, Upload.t()} | {:error, Ecto.Changeset.t()}
  def create_public_link(%Upload{} = upload) do
    token =
      10
      |> :crypto.strong_rand_bytes()
      |> Base.encode32(case: :lower)
      |> binary_part(0, 10)

    upload_changset = change(upload, public_token: token)

    Multi.new()
    |> Multi.update(:upload, upload_changset)
    |> Multi.run(:update_shared_uploads, fn %{upload: upload} ->
      {:ok, Message.update_shared_uploads(upload)}
    end)
    |> Repo.transaction()
  end

  @spec revoke_public_link(Upload.t()) :: {:ok, Upload.t()} | {:error, Ecto.Changeset.t()}
  def revoke_public_link(%Upload{} = upload) do
    upload_changeset = change(upload, public_token: nil)

    Multi.new()
    |> Multi.update(:upload, upload_changeset)
    |> Multi.run(:update_shared_uploads, fn %{upload: upload} ->
      {:ok, Message.update_shared_uploads(upload)}
    end)
    |> Repo.transaction()
  end

  @spec delete(Upload.t()) :: {:ok, Upload.t()} | {:error, Ecto.Changeset.t()}
  def delete(%Upload{} = upload) do
    upload
    |> Repo.delete()
  end

  @spec increment_comment_counter(pos_integer) :: {integer(), nil | list}
  def increment_comment_counter(upload_id) do
    update_comment_counter(upload_id, 1)
  end

  @spec decrement_comment_counter(pos_integer) :: {integer(), nil | list}
  def decrement_comment_counter(upload_id) do
    update_comment_counter(upload_id, -1)
  end

  def update_comment_counter(upload_id, by) do
    _changeset = where(Upload, id: ^upload_id)

    Ecto.Multi.new()
    |> multi_update_comment_counter(upload_id, by)
    |> Repo.transaction()
  end

  def multi_update_comment_counter(multi, upload_id, by) do
    changeset = where(Upload, id: ^upload_id)

    multi
    |> Ecto.Multi.update_all(:upload, changeset, [inc: [comment_count: by]], returning: true)
    |> Ecto.Multi.run(:messages, fn
      %{upload: {1, [upload]}} ->
        Message.update_shared_uploads(upload)
        {:ok, nil}

      %{upload: _} ->
        {:error, nil}
    end)
  end
end
