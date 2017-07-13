import React from "react";
import { render } from "react-dom";

import AuthenticationRouter from "../authentication/authentication_router.jsx";
import Login from "../authentication/login/login.jsx";
import Webapp from "../webapp.jsx";
import Sidemenu from "../sidemenu/sidemenu.jsx";
import RoomsList from "../sidemenu/rooms_list.jsx";
import Room from "../sidemenu/room.jsx";
import Chat from "../chat/chat.jsx";

var componentMap = {
  AuthenticationRouter,
  Login,
  Webapp,
  Sidemenu,
  RoomsList,
  Room,
  Chat
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
