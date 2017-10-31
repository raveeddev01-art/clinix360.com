import React from "react";
import { render } from "react-dom";

export default componentMap => {
  document.querySelectorAll("[data-component]").forEach(el => {
    const json = JSON.parse(el.getAttribute("data-react-props"));
    const key = el.getAttribute("data-component");
    if (componentMap[key]) {
      el.removeAttribute("data-component");
      render(React.createElement(componentMap[key], json), el);
    } else {
      throw new Error(
        `Could not find component ${el.getAttribute("data-component")}.`
      );
    }
  });
};
