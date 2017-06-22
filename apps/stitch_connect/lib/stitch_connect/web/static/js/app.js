import React from "react";
import ReactDOM from "react-dom";
import Button from "react-bootstrap/lib/Button";

console.log("Example");

const project = "Myproject";
setTimeout(() => {
  console.log(`Hello from ${project}!`);
}, 1000);

ReactDOM.render(
  <Button bsStyle="success">Success</Button>,
  document.getElementById("root")
);
