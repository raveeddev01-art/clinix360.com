const devConfig = require("./webpack.dev.config");
const prodConfig = require("./webpack.prod.config");

const isProd = process.env.MIX_ENV === "prod" ? true : false;

module.exports = isProd ? prodConfig : devConfig;
