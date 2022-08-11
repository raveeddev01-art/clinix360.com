defmodule Stitch.Mixfile do
  use Mix.Project

  def project do
    [
      app: :stitch,
      version: "0.1.0",
      build_path: "../../_build",
      config_path: "../../config/config.exs",
      deps_path: "../../deps",
      lockfile: "../../mix.lock",
      elixir: "~> 1.5",
      elixirc_paths: elixirc_paths(Mix.env()),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps()
    ]
  end

  def application do
    [
      mod: {Stitch.Application, []},
      extra_applications: [
        :logger,
        :runtime_tools,
        :appsignal,
        :pdf_generator,
        :ua_inspector,
        :exq,
        :exq_ui,
        :stripity_stripe
      ]
    ]
  end

  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  defp deps do
    [
      {:ecto_sql, "~> 3.8.3"},
      {:ecto, "~> 3.8.4"},
      {:phoenix, "~> 1.6"},
      {:postgrex, "~> 0.16.4"},
      {:redix, "~> 1.1.5"},
      {:comeonin, "~> 5.3.3"},
      {:bcrypt_elixir, "~> 3.0"},
      {:ex_aws, "~> 2.2.10"},
      {:ex_aws_s3, "~> 2.3"},
      {:sweet_xml, "~> 0.7"},
      {:ex_machina, "~> 2.4.0", only: :test},
      {:faker, "~> 0.13.0", only: :test},
      {:slugger, "~> 0.3"},
      {:bamboo, "~> 2.2.0"},
      {:bamboo_phoenix, "~> 1.0"},
      {:timex, "~> 3.0"},
      {:ex_doc, "~> 0.21.3", only: :dev, runtime: false},
      {:stripity_stripe, "~> 2.8"},
      {:appsignal, "~> 2.0"},
      {:mogrify, "~> 0.5.6"},
      {:floki, "~> 0.20.3"},
      {:exmoji, github: "mroth/exmoji"},
      {:pdf_generator, " ~> 0.3.7"},
      {:ua_inspector, "~> 0.17"},
      {:murmur, "~> 1.0.1"},
      {:exq, "~> 0.16.2"},
      {:exq_ui, "~> 0.12.2"},
      {:plug_cowboy, "~> 2.0"},
      {:elasticsearch, "~> 0.4.1"},
      {:librex, "~> 1.0"}
    ]
  end

  defp aliases do
    [
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.create --quiet", "ecto.migrate", "test"]
    ]
  end
end
