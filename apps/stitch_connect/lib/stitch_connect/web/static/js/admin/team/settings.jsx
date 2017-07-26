import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Grid, Row, Col } from 'react-bootstrap';

import Settings from "./settings.jsx";

export default class TeamSettings extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1>Settings</h1>
      </div>
    );
  }
}
