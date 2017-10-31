const webpack = require("webpack");

module.exports = [
  {
    entry: {
      index: "./lib/stitch_connect/web/static/js/index.js",
      landing_app: "./lib/stitch_connect/web/static/js/landing_app.js",
    },
    plugins: [
      new webpack.SourceMapDevToolPlugin({
        filename: "[file].map"
      })
    ]
  }
];
