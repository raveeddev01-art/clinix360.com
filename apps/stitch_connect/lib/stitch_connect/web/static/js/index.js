import "babel-polyfill";

import "./util/delay";
import "./util/electron";
import "./util/fetch";
import "./util/moment";
import componentMap from "./util/app_component_map";
import mounter from "./util/mounter";
import "./util/notify";
import "./util/polyfills";
import "./util/socket";

document.addEventListener("DOMContentLoaded", () => {
  mounter(componentMap);
});
