import React, { Component } from "react";
import Header from "./header";
import OurCustomers from "./our-customers";

class WebFrontApp extends Component {
  render() {
    return (
      <div className="app-webfront">
        <Header />
        <OurCustomers />
      </div>
    );
  }
}

export default WebFrontApp;
