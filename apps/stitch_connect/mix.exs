defmodule StitchConnect.Mixfile do
  use Mix.Project

  def project do
    [
      app: :stitch_connect,
      version: "0.0.1",
      build_path: "../../_build",
      config_path: "../../config/config.exs",
      deps_path: "../../deps",
      lockfile: "../../mix.lock",
      elixir: "~> 1.5",
      elixirc_paths: elixirc_paths(Mix.env),
      compilers: [:phoenix, :gettext] ++ Mix.compilers,
      start_permanent: Mix.env == :prod,
      aliases: aliases(),
      deps: deps(),
      dialyzer: [plt_add_deps: :transitive]
    ]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [
      mod: {StitchConnect.Application, []},
      extra_applications: [:logger, :runtime_tools, :appsignal]
    ]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_),     do: ["lib"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [
      {:phoenix, "~> 1.3.0"},
      {:phoenix_pubsub, "~> 1.0"},
      {:phoenix_html, "~> 2.10"},
      {:phoenix_live_reload, "~> 1.1", only: :dev},
      {:phoenix_ecto, "~> 3.0"},
      {:gettext, "~> 0.13"},
      {:cowboy, "~> 1.1"},
      {:guardian, "~> 0.14"},
      {:poison, "~> 3.1"},
      {:corsica, "~> 1.0"},
      {:credo, "~> 0.8", only: [:dev, :test], runtime: false},
      {:timex, "~> 3.1"},
      {:quantum, ">= 2.1.0"},
      {:sweet_xml, "~> 0.6.5"},
      {:stitch, in_umbrella: true},
      {:appsignal, "~> 1.3"},
      {:pigeon, "~> 1.1.0"}, # For mobile push notifications.
      {:kadabra, "~> 0.3.2"}, # Used by Pigeon for push notifications.
      {:wallaby, "~> 0.19.1", only: :test},
      {:plug_attack, "~> 0.3.0"},
      {:ip2country, "~> 1.1"},
      {:remote_ip, "~> 0.1.4"},
      {:ex_rated, "~> 1.3"}
    ]
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, we extend the test task to create and migrate the database.
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    ["test": ["ecto.create --quiet", "ecto.migrate", "test"]]
  end
end
