import "babel-polyfill";

require("./util/notify.js");
require("./util/fetch.js");
require("./util/delay.js");
require("./util/polyfills.js");
require("./socket.js");
window._ = require("lodash");

import Mounter from "./util/mounter.jsx";
