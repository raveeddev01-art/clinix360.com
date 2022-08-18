defmodule Stitch.Web.HomeController do
  use Stitch.Web, :controller

  def index(conn = %{request_path: path}, _params) do
    login_params = Stitch.Web.PageService.get_logins_json(conn)

    conn
    |> put_layout("home_layout.html")
    |> assign(:title, title_for_path(path))
    |> assign(:description, description_for_path(path))
    |> render("index.html", login_params: login_params)
  end

  # If you change a title, sync it with frontend (website_router)
  @connect_title "Connect | InvoChat"
  @connect_description "InvoChat is a team messaging app for InvoChat teams. Bring your team together with rooms and direct messages on any device."

  @customers_title "Customers | InvoChat"
  @customers_description "Trusted by the best InvoChat teams, big and small. See how customers have improved work coordination on our platform."

  @demo_title "Request a Demo | InvoChat"
  @demo_description "Request a Demo of InvoChat today. Stitch is free to use with an unlimited number of people."

  @downloads_title "Downloads | InvoChat"
  @downloads_description "Download InvoChat for free for mobile devices or desktop. Stay in the loop with our apps for iPhone, Android, Mac and Windows."

  @engage_title "Engage | InvoChat"
  @engage_description "InvoChat Engage is a patient communication app for InvoChat teams. From messages and forms to files and tasks, engage your patients on every level."

  @hipaa_title "HIPAA Compliance | InvoChat"
  @hipaa_description "InvoChat is fully HIPAA compliant. Relax knowing we’ve got you covered. Directly name patients and share files in our secure workspace."

  @jobs_title "Jobs | InvoChat"
  @jobs_description "We’re hiring! If you’re passionate about making an impact in InvoChat by building great technology, then we want to meet you."

  @manage_title "Manage | InvoChat"
  @manage_description "InvoChat Manage is a task management app for InvoChat teams. Instantly know what your team is doing and ensure every patient task goes from start to done."

  @pricing_title "Pricing | InvoChat"
  @pricing_description "Free to start, with upgradeable plans available. Our products work together in a single place. Start with one or many."

  defp title_for_path("/connect" <> _rest), do: @connect_title
  defp title_for_path("/customers" <> _rest), do: @customers_title
  defp title_for_path("/demo" <> _rest), do: @demo_title
  defp title_for_path("/downloads" <> _rest), do: @downloads_title
  defp title_for_path("/engage" <> _rest), do: @engage_title
  defp title_for_path("/hipaa" <> _rest), do: @hipaa_title
  defp title_for_path("/jobs" <> _rest), do: @jobs_title
  defp title_for_path("/manage" <> _rest), do: @manage_title
  defp title_for_path("/pricing" <> _rest), do: @pricing_title
  defp title_for_path(_other_path), do: nil

  defp description_for_path("/connect" <> _rest), do: @connect_description
  defp description_for_path("/customers" <> _rest), do: @customers_description
  defp description_for_path("/demo" <> _rest), do: @demo_description
  defp description_for_path("/downloads" <> _rest), do: @downloads_description
  defp description_for_path("/engage" <> _rest), do: @engage_description
  defp description_for_path("/hipaa" <> _rest), do: @hipaa_description
  defp description_for_path("/jobs" <> _rest), do: @jobs_description
  defp description_for_path("/manage" <> _rest), do: @manage_description
  defp description_for_path("/pricing" <> _rest), do: @pricing_description
  defp description_for_path(_other_path), do: nil
end
