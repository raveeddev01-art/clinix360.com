{:ok, _} = Application.ensure_all_started(:wallaby)
ExUnit.start()

Application.put_env(:wallaby, :base_url, StitchConnect.Web.Endpoint.url)
Ecto.Adapters.SQL.Sandbox.mode(Stitch.Repo, :manual)
