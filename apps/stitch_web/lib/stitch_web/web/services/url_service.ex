defmodule Stitch.Web.UrlService do
  @endpoint Stitch.Web.Endpoint

  alias Stitch.Web.SubdomainRouter.Helpers, as: SubdomainRoutes
  alias Stitch.Web.Router.Helpers, as: Routes

  alias Stitch.{
    Files.Upload,
    Files.EngageUpload,
    Message,
    Team,
    TeamQueries
  }

  @doc """
  Redirect to the team login page. The team is inferred from the resource.
  This can be used when you need to redirect from one subdomain to another.
  Fallback is the root login page.
  """
  @spec team_login_url(Upload.t() | Message.t() | Team.t() | EngageUpload.t()) :: binary
  def team_login_url(%EngageUpload{team_id: team_id}) do
    team_id
    |> TeamQueries.get_by_id()
    |> team_login_url()
  end

  def team_login_url(%Upload{team_id: team_id}) do
    team_id
    |> TeamQueries.get_by_id()
    |> team_login_url()
  end

  def team_login_url(%Message{group: %{team_id: team_id}}) do
    team_id
    |> TeamQueries.get_by_id()
    |> team_login_url()
  end

  def team_login_url(%Team{} = team) do
    struct_url = @endpoint.struct_url()
    struct_url = %{struct_url | host: "#{team.slug}.#{struct_url.host}"}
    SubdomainRoutes.authentication_url(struct_url, :login)
  end

  def team_login_url(_), do: login_url()

  @spec login_url() :: binary
  def login_url() do
    struct_url = @endpoint.struct_url()
    Routes.authentication_url(struct_url, :index)
  end

  @spec file_show_url(Upload.t()) :: binary
  def file_show_url(%Upload{} = upload) do
    struct_url = @endpoint.files_struct_url()
    encoded_file_id = Upload.encode_url_id(upload)
    SubdomainRoutes.api_v1_file_path(struct_url, :show, encoded_file_id)
  end

  def public_download_page(upload, token) do
    struct_url = @endpoint.files_struct_url()
    encoded_file_id = Upload.encode_url_id(upload)

    SubdomainRoutes.files_public_file_url(
      struct_url,
      :public_download,
      "#{encoded_file_id}-#{token}"
    )
  end

  @spec file_download_url(EngageUpload.t() | Upload.t(), map | nil) :: binary

  def file_download_url(upload, query_params \\ %{})

  def file_download_url(%EngageUpload{} = upload, query_params) do
    struct_url = @endpoint.files_struct_url()
    encoded_file_id = EngageUpload.encode_url_id(upload)

    SubdomainRoutes.files_file_url(
      struct_url,
      :download,
      encoded_file_id,
      upload.filename,
      query_params
    )
  end

  @spec file_download_url(Upload.t(), map | nil) :: binary
  def file_download_url(%Upload{} = upload, query_params) do
    struct_url = @endpoint.files_struct_url()
    encoded_file_id = Upload.encode_url_id(upload)

    SubdomainRoutes.files_file_url(
      struct_url,
      :download,
      encoded_file_id,
      upload.filename,
      query_params
    )
  end

  @spec file_preview_url(Upload.t(), map | nil) :: binary
  def file_preview_url(%Upload{} = upload, query_params \\ %{}) do
    struct_url = @endpoint.files_struct_url()
    encoded_file_id = Upload.encode_url_id(upload)
    SubdomainRoutes.files_file_url(struct_url, :download_preview, encoded_file_id, query_params)
  end
end
