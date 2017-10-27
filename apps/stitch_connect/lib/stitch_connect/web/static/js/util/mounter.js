import React from "react";
import { render } from "react-dom";

import AuthenticationRouter from "../authentication/index";
import Login from "../authentication/login/login";
import App from "../app/app";
import Invitation from "../invitation/index";
import Website from "../website/index";
import Toastr from "../common/components/toastr/toastr";

const componentMap = {
  AuthenticationRouter,
  Login,
  App,
  Toastr,
  Invitation,
  Website
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
