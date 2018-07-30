defmodule Stitch.Files.EngageUpload do
  alias Stitch.{
    Accounts.User,
    Files.EngageUpload,
    Files.PatientUpload,
    Files.Upload,
    Files.UploadComment,
    Files.GroupUpload,
    Files.Thumb,
    Engage.ConversationMessage.ConversationMessageCreation,
    Rand,
    Patient,
    Repo,
    Team,
    Group
  }

  use Ecto.Schema
  import Ecto.Query
  import Ecto.Changeset
  alias Ecto.Multi

  @type t :: %__MODULE__{}

  schema "engage_uploads" do
    belongs_to(:team, Team)
    belongs_to(:provider, User)

    field(:filename, :string)
    field(:url, :string)
    field(:mimetype, :string, default: "application/octet-stream")
    field(:filetype, :string, default: "binary")
    field(:size_in_bytes, :integer)
    field(:preview_height, :integer)
    field(:preview_width, :integer)
    field(:preview_url, :string)

    timestamps()
  end

  @attributes [
    :filename,
    :url,
    :mimetype,
    :filetype,
    :size_in_bytes,
    :preview_height,
    :preview_width,
    :preview_url
  ]

  @spec new(EngageUpload.t(), map) :: Ecto.Changeset.t()
  def new(%EngageUpload{} = struct, attrs) do
    struct
    |> cast(attrs, @attributes)
    |> validate_required([:url])
    |> Upload.put_default_name()
    |> Upload.put_filetype()
  end

  # Create EngageUpload
  # Create PatientUpload to connect with patient
  # Create ConversationMessage pointing to EngageUpload (copying fields)
  #
  def create_and_share_with_patient(
        %User{} = provider,
        %Patient{} = patient,
        conversation,
        sender,
        attrs
      ) do
    struct = %EngageUpload{provider_id: provider.id, team_id: provider.team_id}
    fields = attrs["fields"] || %{}
    {:ok, preview_metadata} = create_preview(fields)
    fields = Map.merge(fields, preview_metadata)

    Multi.new()
    |> Multi.insert(:engage_upload, new(struct, fields))
    |> Multi.run(:patient_upload, fn %{engage_upload: engage_upload} ->
      PatientUpload.create(patient, engage_upload)
    end)
    |> Multi.run(:conversation_message, fn %{engage_upload: engage_upload} ->
      params =
        Map.merge(attrs, %{
          "fields" => fields(engage_upload),
          "type" => "upload",
          "engage_upload_id" => engage_upload.id
        })

      {:ok, %{conversation_message: conversation_message}} =
        ConversationMessageCreation.create(conversation, sender, params)

      {:ok, conversation_message}
    end)
    |> Repo.transaction()
  end

  def create_preview(fields) do
    case Thumb.create(fields) do
      {:ok, preview_metadata} ->
        {:ok, preview_metadata}

      {:error, "Unsupported type"} ->
        {:ok, %{}}

      {:error, _error} ->
        {:ok, %{}}
    end
  end

  @spec fields(EngageUpload.t()) :: map
  def fields(%EngageUpload{} = engage_upload) do
    engage_upload
    |> Map.take(@attributes)
    |> Map.new(fn {k, v} -> {"#{k}", v} end)
    |> Map.put("encoded_id", EngageUpload.encode_url_id(engage_upload))
  end

  @spec delete(EngageUpload.t()) :: {:ok, EngageUpload.t()} | {:error, Ecto.Changeset.t()}
  def delete(%EngageUpload{} = engage_upload) do
    engage_upload
    |> Repo.delete()
  end

  @spec encode_url_id(EngageUpload.t()) :: String.t()
  def encode_url_id(%EngageUpload{} = engage_upload) do
    "e" <> Base.encode32("#{engage_upload.id}", case: :lower, padding: false)
  end

  @spec decode_url_id(String.t()) :: {:ok, integer} | :error
  def decode_url_id("e" <> engage_upload_id) do
    with {:ok, string_id} <- Base.decode32("#{engage_upload_id}", case: :lower, padding: false),
         {int_id, _} <- Integer.parse(string_id) do
      {:ok, int_id}
    else
      _ -> :error
    end
  end
end
