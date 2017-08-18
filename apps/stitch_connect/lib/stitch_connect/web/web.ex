defmodule StitchConnect.Web do
  @moduledoc """
  A module that keeps using definitions for controllers,
  views and so on.

  This can be used in your application as:

      use StitchConnect.Web, :controller
      use StitchConnect.Web, :view

  The definitions below will be executed for every view,
  controller, etc, so keep them short and clean, focused
  on imports, uses and aliases.

  Do NOT define functions inside the quoted expressions
  below.
  """

  def controller do
    quote do
      use Phoenix.Controller, namespace: StitchConnect.Web
      import Plug.Conn
      import StitchConnect.Web.{Router.Helpers, ControllerHelpers}
      import StitchConnect.Web.Gettext
    end
  end

  def view do
    quote do
      use Phoenix.View, root: "lib/stitch_connect/web/templates",
                        namespace: StitchConnect.Web

      # Import convenience functions from controllers
      import Phoenix.Controller, only: [get_csrf_token: 0, get_flash: 2, view_module: 1]

      # Use all HTML functionality (forms, tags, etc)
      use Phoenix.HTML

      import StitchConnect.Web.Router.Helpers
      import StitchConnect.Web.ErrorHelpers
      import StitchConnect.Web.Gettext
    end
  end

  def router do
    quote do
      use Phoenix.Router
      import Plug.Conn
      import Phoenix.Controller
    end
  end

  def channel do
    quote do
      use Phoenix.Channel
      import StitchConnect.Web.Gettext
    end
  end

  @doc """
  When used, dispatch to the appropriate controller/view/etc.
  """
  defmacro __using__(which) when is_atom(which) do
    apply(__MODULE__, which, [])
  end
end
