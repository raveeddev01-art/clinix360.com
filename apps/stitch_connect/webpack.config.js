const webpackMerge = require("webpack-merge");
const devConfig = require("./webpack.dev.config");
const prodConfig = require("./webpack.prod.config");
const baseConfig = require("./webpack.base.config");

const isProd = process.env.MIX_ENV === "prod";
const config = isProd ? prodConfig : devConfig;

module.exports = webpackMerge.multiple(baseConfig, config);
