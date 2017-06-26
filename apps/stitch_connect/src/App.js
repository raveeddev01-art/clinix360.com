import React, { Component } from "react";
import { Button } from "react-bootstrap";
import logo from "./logo.svg";
import "./App.css";

class App extends Component {
  content = () => {
    return <p>Example</p>;
  };

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
          <Button bsStyle="primary" block>Next</Button>
          {this.content()}
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
