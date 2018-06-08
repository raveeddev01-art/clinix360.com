import React, { Component } from "react";
import { Provider } from "mobx-react";
import { BrowserRouter as Router } from "react-router-dom";

import WebsiteRouter from "./website_router";
import WebsiteStore from "../common/stores/website_store";

const Website = props => {
  const websiteStore = new WebsiteStore(props);

  return (
    <div>
      <Router>
        <Provider {...websiteStore}>
          <WebsiteRouter teams={props.teams}>
          </WebsiteRouter>
        </Provider>
      </Router>
    </div>
  );
};

export default Website;

