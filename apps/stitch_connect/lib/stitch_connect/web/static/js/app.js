import React from "react";
import ReactDOM from "react-dom";
import Button from "react-bootstrap/lib/Button";
import SignIn from "./authentication/sign_in.jsx";

console.log("Example");

const project = "Myproject";
setTimeout(() => {
  console.log(`Hello fromx ${project}!`);
}, 1000);

ReactDOM.render(<SignIn name={"Sergio"} />, document.getElementById("root"));
