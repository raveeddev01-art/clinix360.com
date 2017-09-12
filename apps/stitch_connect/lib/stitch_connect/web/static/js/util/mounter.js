import React from "react";
import { render } from "react-dom";

import AuthenticationRouter from "../authentication/authentication_router";
import Login from "../authentication/login/login";
import App from "../app/app";
import Admin from "../admin/admin";
import Invitation from "../invitation/index";
import Toastr from "../common/components/toastr/toastr";

var componentMap = {
  AuthenticationRouter,
  Login,
  App,
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
