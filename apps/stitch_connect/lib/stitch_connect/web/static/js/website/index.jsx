import React, { Component } from "react";
import { BrowserRouter as Router } from "react-router-dom";

import WebsiteRouter from "./website_router";

class Website extends Component {
  render() {
    let teams = this.props.teams || []

    return (
      <div>
        <Router>
          <WebsiteRouter teams={teams} />
        </Router>
      </div>
    );
  }
}

export default Website;
