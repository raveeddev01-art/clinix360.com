const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = [
  {
    entry: "./lib/stitch_connect/web/static/js/index.js",
    output: {
      path: path.resolve(__dirname, "priv/static/js"),
      filename: "index.js"
    },
    resolve: {
      extensions: [".js", ".jsx"],
      modules: ["node_modules", __dirname + "/web/static/js"]
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
      new webpack.SourceMapDevToolPlugin({
        filename: "[file].map"
      })
    ]
  },
  {
    entry: "./lib/stitch_connect/web/static/stylesheets/app.scss",
    output: {
      path: path.resolve(__dirname, "priv/static/css"),
      filename: "app.css"
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
        }
      ]
    },
    plugins: [
      new ExtractTextPlugin("app.css"),
      new CopyWebpackPlugin([
        {
          from: "./lib/stitch_connect/web/static/favicon.ico",
          to: path.resolve(__dirname, "priv/static")
        }
      ]),
      new CopyWebpackPlugin([
        {
          from: "./lib/stitch_connect/web/static/favicon-192x192.png",
          to: path.resolve(__dirname, "priv/static")
        }
      ]),
      new CopyWebpackPlugin([
        {
          from: "./lib/stitch_connect/web/static/audios/pop.mp3",
          to: path.resolve(__dirname, "priv/static/audios")
        }
      ]),
      new CopyWebpackPlugin([
        {
          from: "./lib/stitch_connect/web/static/images",
          to: path.resolve(__dirname, "priv/static/images")
        }
      ])
    ]
  }
];
