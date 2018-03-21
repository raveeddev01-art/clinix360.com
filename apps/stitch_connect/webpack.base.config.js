const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = [
  {
    entry: {
      index: "./lib/stitch_connect/web/static/js/index.js",
      landing_app: "./lib/stitch_connect/web/static/js/landing_app.js",
    },
    output: {
      path: path.resolve(__dirname, "priv/static/js"),
      filename: "[name].js"
    },
    resolve: {
      extensions: [".js", ".jsx"],
      modules: ["node_modules", path.resolve(__dirname, "./lib/stitch_connect/web/static/js")],
    },
    module: {
      loaders: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          loader: "babel-loader",
          query: {
            plugins: ["transform-decorators-legacy"],
            presets: ["env", "react", "stage-2"]
          }
        }
      ]
    },
    plugins: [
      new webpack.ProvidePlugin({
        jQuery: "jquery",
        $: "jquery"
      })
    ]
  },
  {
    entry: {
      app: "./lib/stitch_connect/web/static/stylesheets/app.scss",
      landing: "./lib/stitch_connect/web/static/stylesheets/landing.scss",
      "landing-non-critical": "./lib/stitch_connect/web/static/stylesheets/landing-non-critical.scss"
    },
    output: {
      path: path.resolve(__dirname, "priv/static/css"),
      filename: "[name].css"
    },
    resolve: {
      modules: ["node_modules"]
    },
    module: {
      loaders: [
        {
          test: /\.(scss|css)$/,
          exclude: /node_modules/,
          use: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: ["css-loader", "sass-loader"]
          })
        },
        {
          test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
          loader: "file-loader?name=fonts/[name].[ext]"
        }
      ]
    },
    plugins: [
      new ExtractTextPlugin('[name].css'),
      new CopyWebpackPlugin([
        {
          from: "./lib/stitch_connect/web/static/favicon.ico",
          to: path.resolve(__dirname, "priv/static")
        },
        {
          from: "./lib/stitch_connect/web/static/favicon-192x192.png",
          to: path.resolve(__dirname, "priv/static")
        },
        {
          from: "./lib/stitch_connect/web/static/robots.txt",
          to: path.resolve(__dirname, "priv/static")
        },
        {
          from: "./lib/stitch_connect/web/static/sitemap.xml",
          to: path.resolve(__dirname, "priv/static")
        },
        {
          from: "./lib/stitch_connect/web/static/audios/pop.mp3",
          to: path.resolve(__dirname, "priv/static/audios")
        },
        {
          from: "./lib/stitch_connect/web/static/images",
          to: path.resolve(__dirname, "priv/static/images")
        }
      ])
    ]
  }
];
