import "babel-polyfill";

import "./util/delay";
import "./util/electron";
import "./util/fetch";
import "./util/moment";
import "./util/notify";
import "./util/polyfills";
import "./util/socket";
import "./util/countries";

import componentMap from "./util/app_component_map";
import mounter from "./util/mounter";

document.addEventListener("DOMContentLoaded", () => {
  mounter(componentMap);
});
