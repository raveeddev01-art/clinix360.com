import "babel-polyfill";
import "./util/fetch";
import "./util/moment";
import "./util/polyfills";
import componentMap from "./util/landing_component_map";
import mounter from "./util/mounter";

document.addEventListener("DOMContentLoaded", () => {
  mounter(componentMap);
});
