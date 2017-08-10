import "babel-polyfill";

require("./util/delay.js");
require("./util/fetch.js");
require("./util/notify.js");
require("./util/polyfills.js");
require("./util/string.js");
require("./socket.js");
window._ = require("lodash");

import Mounter from "./util/mounter.jsx";
