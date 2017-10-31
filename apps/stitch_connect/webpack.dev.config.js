const webpack = require("webpack");

module.exports = [
  {
    entry: "./lib/stitch_connect/web/static/js/index.js",
    plugins: [
      new webpack.SourceMapDevToolPlugin({
        filename: "[file].map"
      })
    ]
  }
];
