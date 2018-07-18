import React, { Component } from "react";
import { BrowserRouter as Router } from "react-router-dom";

import WebsiteRouter from "./website_router";

const Website = props => {
  return (
    <div>
      <Router>
        <WebsiteRouter />
      </Router>
    </div>
  );
};

export default Website;
