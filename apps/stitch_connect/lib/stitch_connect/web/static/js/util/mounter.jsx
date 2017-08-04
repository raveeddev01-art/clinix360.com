import React from "react";
import { render } from "react-dom";

import AuthenticationRouter from "../authentication/authentication_router.jsx";
import Login from "../authentication/login/login.jsx";
import Webapp from "../webapp.jsx";
import Team from "../sidemenu/team.jsx";
import Addons from "../addons/addons.jsx";
import Admin from "../admin/admin.jsx";
import Invitation from "../invitation/index.jsx";
import Toastr from "../common/components/toastr/toastr.jsx";

var componentMap = {
  AuthenticationRouter,
  Login,
  Webapp,
  Admin,
  Toastr,
  Invitation
};

window.mountComponents = () => {
  for (var el of document.querySelectorAll("[data-component]")) {
    let json = JSON.parse(el.getAttribute("data-react-props"));
    let found = false;
    for (var key of Object.keys(componentMap)) {
      if (key === el.getAttribute("data-component")) {
        el.removeAttribute("data-component");
        render(React.createElement(componentMap[key], json), el);
        found = true;
        break;
      }
    }
    if (!found)
      throw `Could not find component ${el.getAttribute("data-component")}.`;
  }
};

document.addEventListener("DOMContentLoaded", function(event) {
  window.mountComponents();
});
