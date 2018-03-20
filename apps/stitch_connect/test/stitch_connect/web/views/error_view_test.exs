defmodule StitchConnect.Web.ErrorViewTest do
  use StitchConnect.Web.ConnCase, async: true
  # Bring render_to_string/3 for testing custom views
  import Phoenix.View

  describe "Not Found" do
    setup %{conn: conn} do
      {:ok, conn: with_session(conn)}
    end

    test "raises a 404 correctly", %{conn: conn} do
      assert_raise Phoenix.Router.NoRouteError, fn ->
        get(conn, "/unknown_page")
      end
    end
  end

  describe "System Errors" do
    setup %{conn: conn} do
      new_conn = conn
        |> with_session()
        |> get("/")

      {:ok, conn: new_conn}
    end

    test "500 renders system error page", %{conn: conn} do
      error_res = render_to_string(StitchConnect.Web.ErrorView, "500.html", [conn: conn])
      assert error_res =~ "Stitch failed to load correctly"
    end

    test "5** renders system error page", %{conn: conn} do
      error_res = render_to_string(StitchConnect.Web.ErrorView, "505.html", [conn: conn])
      assert error_res =~ "Stitch failed to load correctly"
    end
  end
end
