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
      elixirc_paths: elixirc_paths(Mix.env),
      start_permanent: Mix.env == :prod,
      aliases: aliases(),
      deps: deps()
    ]
  end

  def application do
    [
      mod: {Stitch.Application, []},
      extra_applications: [:logger, :runtime_tools, :appsignal]
    ]
  end

  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_),     do: ["lib"]

  defp deps do
    [
      {:ecto, "~> 2.2"},
      {:postgrex, "~> 0.13.3"},
      {:comeonin, "~> 4.0"},
      {:bcrypt_elixir, "~> 1.0"},
      {:ex_aws, "~> 2.0"},
      {:ex_aws_s3, "~> 2.0"},
      {:sweet_xml, "~> 0.6"},
      {:ex_machina, "~> 2.1", only: :test},
      {:faker, "~> 0.9", only: :test},
      {:slugger, "~> 0.2"},
      {:bamboo, "~> 0.8"},
      {:timex, "~> 3.1"},
      {:ex_doc, "~> 0.16", only: :dev, runtime: false},
      {:stripity_stripe, "~> 1.6"},
      {:appsignal, "~> 1.3"},
      {:mogrify, "~> 0.5.6"},
      {:floki, "~> 0.18.1"}
    ]
  end

  defp aliases do
    [
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      "test": ["ecto.create --quiet", "ecto.migrate", "test"]
    ]
  end
end
