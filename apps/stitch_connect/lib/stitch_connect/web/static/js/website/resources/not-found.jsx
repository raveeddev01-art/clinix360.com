import React, { Component } from "react";

import Header from "../components/header";
import Subheader from "../components/subheader";
import Footer from "../components/footer";

export default class NotFound extends Component {
  render() {
    return (
      <div>
        <Header />
        <Subheader title="Page Not Found" />

        <div className="not-found-wrapper">
          <p className="not-found-header">
            Sorry, but the page you were looking for could not be found.
          </p>
          <p className="not-found-text">
            You can return to our homepage or <a href="mailto:support@teamstitch.com">email us </a>
            if you can't find what you're looking for.
          </p>
        </div>
        <Footer />
      </div>
    );
  }
}
