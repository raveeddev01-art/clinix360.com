import "babel-polyfill";
import "./util/electron";
import "./util/fetch";
import "./util/polyfills";

import componentMap from "./util/landing_component_map";
import mounter from "./util/mounter";

document.addEventListener("DOMContentLoaded", () => {
  mounter(componentMap);
});
