const webpack = require("webpack");

module.exports = [
  {
    entry: {
      index: "./lib/stitch_web/web/static/js/index.js",
      landing_app: "./lib/stitch_web/web/static/js/landing_app.js",
      patient_app: "./lib/stitch_web/web/static/js/patient_app.js"
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
