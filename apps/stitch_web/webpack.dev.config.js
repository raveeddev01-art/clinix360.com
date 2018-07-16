const webpack = require("webpack");

module.exports = [
  {
    entry: {
      index: "./lib/stitch_web/web/static/js/index.js",
      landing_app: "./lib/stitch_web/web/static/js/landing_app.js",
      patient_app: "./lib/stitch_web/web/static/js/patient_app.js"
    },
    plugins: [
      new webpack.SourceMapDevToolPlugin({
        filename: "[file].map"
      })
    ]
  }
];
