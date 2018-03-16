import React, { Component } from "react";
import { BrowserRouter as Router } from "react-router-dom";

import WebsiteRouter from "./website_router";

class Website extends Component {
  render() {
    return (
      <div>
        <Router>
          <WebsiteRouter />
        </Router>
      </div>
    );
  }
}

export default Website;
