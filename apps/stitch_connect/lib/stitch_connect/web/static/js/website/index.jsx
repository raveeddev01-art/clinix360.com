import React, { Component } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "mobx-react";

import WebsiteRouter from "./website_router";

class Website extends Component {
  render() {
    return (
      <div>
        <Router>
          <Provider>
            <WebsiteRouter />
          </Provider>
        </Router>
      </div>
    );
  }
}

export default Website;
