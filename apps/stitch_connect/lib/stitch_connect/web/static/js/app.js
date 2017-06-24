import React from "react";
import ReactDOM from "react-dom";
import Button from "react-bootstrap/lib/Button";

import Authentication from "./authentication/authentication.jsx";

console.log("Example");

const project = "Myproject";
setTimeout(() => {
  console.log(`Hello from ${project}!`);
}, 1000);

ReactDOM.render(<Authentication />, document.getElementById("root"));
