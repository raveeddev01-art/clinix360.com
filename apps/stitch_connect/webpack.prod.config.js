const webpack = require("webpack");

module.exports = [
  {
    entry: {
      index: "./lib/stitch_connect/web/static/js/index.js",
      landing_app: "./lib/stitch_connect/web/static/js/landing_app.js",
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify("production")
        }
      }),
      new webpack.optimize.UglifyJsPlugin({
        compressor: {
          warnings: false
        }
      })
    ]
  }
];
