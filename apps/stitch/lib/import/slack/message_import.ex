defmodule Stitch.Import.Slack.MessageImport do
  alias Stitch.{Repo, Message}

  # 1 GB
  @max_file_size 1_000_000_000

  require Logger

  #   {
  #     "type": "message",
  #     "subtype": "file_share",
  #     "text": "",
  #     "file": {
  #     },
  #     "user": "U0000001",
  #     "upload": true,
  #     "display_as_bot": false,
  #     "username": "username",
  #     "bot_id": null,
  #     "ts": "1424013078.000001"
  #   }
  def import_message(
        team,
        group,
        users_by_slack_import_id,
        groups_by_slack_import_id,
        message_json
      ) do
    if message_json["subtype"] == nil do
      import_text_message(
        team,
        group,
        users_by_slack_import_id,
        groups_by_slack_import_id,
        message_json
      )
    else
      if message_json["subtype"] == "file_share" do
        import_file(
          team,
          group,
          users_by_slack_import_id,
          groups_by_slack_import_id,
          message_json
        )
      else
        nil
      end
    end
  end

  def import_text_message(
        _team,
        group,
        users_by_slack_import_id,
        groups_by_slack_import_id,
        message_json
      ) do
    text = message_json["text"]
    inserted_at = get_datetime(message_json["ts"])
    creator = get_creator(message_json["user"], users_by_slack_import_id)
    text_content = get_text(text, groups_by_slack_import_id, users_by_slack_import_id)

    # Since slack doesn't provide ids for messages, we generate hash of the json content using Murmur
    slack_import_id = Murmur.hash_x86_128(Poison.encode!(message_json)) |> Integer.to_string()

    if text && inserted_at && creator do
      if Repo.get_by(
           Message,
           group_id: group.id,
           user_id: creator.id,
           slack_import_id: slack_import_id
         ) do
        # "Skipping already imported message"
        nil
      else
        mentioned_user_id =
          Stitch.Message.Mention.get_mentioned_user_ids(
            Repo.preload(group, :users).users,
            creator,
            text_content,
            [],
            group
          )

        %Message{
          inserted_at: inserted_at,
          updated_at: inserted_at,
          text_content: text_content,
          mentioned_user_ids: mentioned_user_id,
          user_id: creator.id,
          group_id: group.id,
          slack_import_id: slack_import_id
        }
        |> Repo.insert()
      end
    else
      Logger.error(
        "[#{__MODULE__}] Error creating message for #{inspect([text, inserted_at, creator])}"
      )
    end
  end

  def get_creator(slack_user_id, users_by_slack_import_id) do
    Map.get(users_by_slack_import_id, slack_user_id)
  end

  def get_text(nil, _groups_by_slack_import_id, _users_by_slack_import_id), do: nil
  def get_text("", _groups_by_slack_import_id, _users_by_slack_import_id), do: nil

  @doc """
  Translates Slack mentions to Stitch mentions.
  """
  def get_text(text, groups_by_slack_import_id, users_by_slack_import_id) do
    Regex.replace(~r/\<([^>]+)\>/, text, fn
      "<!here>", _ ->
        "<@Ghere>"

      "<!channel>", _ ->
        "<@Groom>"

      "<!everyone>", _ ->
        "<@Groom>"

      "<#C" <> _ = full_text, "#" <> slack_channel_id ->
        slack_channel_id = slack_channel_id |> String.split("|") |> List.first()

        case Map.fetch(groups_by_slack_import_id, slack_channel_id) do
          {:ok, group} ->
            "<@G#{group.id}>"

          :error ->
            full_text
        end

      "<@U" <> _ = full_text, "@" <> slack_user_id ->
        case Map.fetch(users_by_slack_import_id, slack_user_id) do
          {:ok, user} ->
            "<@U#{user.id}>"

          :error ->
            full_text
        end

      _full_text, "https://" <> _ = url ->
        url |> String.split("|") |> List.first()

      _full_text, "http://" <> _ = url ->
        url |> String.split("|") |> List.first()

      _full_text, "mailto:" <> email ->
        email |> String.split("|") |> List.first()

      _full_text, "tel:" <> tel ->
        tel |> String.split("|") |> List.first()

      full_text, _captured ->
        full_text
    end)
  end

  def get_datetime(ts) do
    try do
      String.split(ts, ".") |> List.first() |> String.to_integer() |> DateTime.from_unix!()
    rescue
      error ->
        Logger.error("[#{__MODULE__}] Error parsing timestamp #{inspect(error)} #{inspect(ts)}")
        DateTime.utc_now()
    end
  end

  # {
  #   "url": "https://s3.amazonaws.com/bucketname/13245.jpg",
  #   "filename": "sunset.jpg",
  #   "mimetype": "image/jpeg",
  #   "preview_url": "https://s3.amazonaws.com/bucketname/12345.jpg",
  #   "preview_width": 276,
  #   "size_in_bytes": 5059,
  #   "preview_height": 183
  #  }
  #
  #   {
  #     "id": "F10000000",
  #     "name": "Pasted image at 1234 PM.png",
  #     "mimetype": "image\/png",
  #     "size": 1095514,
  #     "url_private_download": "...",
  # },

  def import_file(
        _team,
        group,
        users_by_slack_import_id,
        groups_by_slack_import_id,
        message_json
      ) do
    text = ""
    inserted_at = get_datetime(message_json["ts"])
    creator = get_creator(message_json["user"], users_by_slack_import_id)
    text_content = get_text(text, groups_by_slack_import_id, users_by_slack_import_id)
    # File ids are at "file.id"
    slack_import_id = get_in(message_json, ["file", "id"])
    mimetype = get_in(message_json, ["file", "mimetype"])
    slack_download_url = get_in(message_json, ["file", "url_private_download"])
    file_size = get_in(message_json, ["file", "size"])

    if inserted_at && creator && slack_import_id && mimetype && slack_download_url && file_size do
      if Repo.get_by(
           Message,
           group_id: group.id,
           user_id: creator.id,
           slack_import_id: slack_import_id
         ) do
        # "Skipping already imported message"
        nil
      else
        if file_size > @max_file_size do
          Logger.warn(
            "[#{__MODULE__}] File is too large #{inspect(%{mimetype: mimetype, size: file_size})}"
          )
        else
          case import_file(slack_download_url) do
            {:ok, imported_url, filename} ->
              fields = %{url: imported_url, mimetype: mimetype, filename: filename}

              %Message{
                inserted_at: inserted_at,
                updated_at: inserted_at,
                text_content: text_content,
                mentioned_user_ids: [],
                user_id: creator.id,
                group_id: group.id,
                slack_import_id: slack_import_id,
                type: "upload",
                fields: fields
              }
              |> Repo.insert()

            # |> add_preview()

            error ->
              Logger.error("[#{__MODULE__}] Error importing file #{inspect(error)}")
          end
        end
      end
    else
      Logger.error(
        "[#{__MODULE__}] Error creating message for #{
          inspect([inserted_at, creator, slack_import_id, mimetype, slack_download_url, file_size])
        }"
      )
    end
  end

  # TODO: temporarily disabled
  # def add_preview({:ok, message}) do
  #   message
  #   |> Stitch.UploadPreview.add_preview()
  # end

  # def add_preview(result), do: result

  @doc """
  Extract filename and extension,
  Add hashing to filename,
  Download file,
  Upload to the S3 bucket

  upload to S3,
  get URL,
  create fields: {mimetype: mimetype, url: url},
  create message,
  call Stitch.UploadPreview.add_preview
  """
  def import_file(slack_download_file) do
    with %URI{path: filename} <- slack_download_file |> Path.basename() |> URI.parse(),
         filename = String.downcase(Stitch.Rand.token(8)) <> "_" <> filename,
         {:ok, %{body: binary_data}} <- HTTPoison.get(slack_download_file),
         filepath = Path.join(System.tmp_dir!(), filename),
         _ <- File.rm(filepath),
         {:file_written, :ok} <- {:file_written, File.write(filepath, binary_data)},
         {:ok, %{status_code: 200}} <- Stitch.AWS.S3.upload(filepath),
         :ok <- File.rm(filepath) do
      {:ok, Stitch.AWS.S3.fullpath(filename), filename}
    else
      error ->
        IO.inspect("Error downloading file #{slack_download_file}")
        error
    end
  end
end
