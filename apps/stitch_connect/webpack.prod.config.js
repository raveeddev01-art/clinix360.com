const webpack = require("webpack");

module.exports = [
  {
    entry: "./lib/stitch_connect/web/static/js/index.js",
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
