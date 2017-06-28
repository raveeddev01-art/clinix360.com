const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = [
  {
    entry: "./lib/stitch_connect/web/static/js/app.js",
    output: {
      path: path.resolve(__dirname, "priv/static/js"),
      filename: "app.js"
    },
    resolve: {
      modules: ["node_modules", __dirname + "/web/static/js"]
    },
    module: {
      loaders: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          loader: "babel-loader",
          query: {
            presets: ["env", "react", "stage-2"]
          }
        }
      ]
    }
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
          test: /\.scss$/,
          exclude: /node_modules/,
          use: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: ["css-loader", "sass-loader"]
          })
        }
      ]
    },
    plugins: [new ExtractTextPlugin("app.css")]
  }
];
