import React, { Component } from "react";
import { Link } from "react-router-dom";

import Header from "../components/header";
import Footer from "../components/footer";

import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";

export default class Jobs extends Component {
  render() {
    return (
      <div>
        <Header />

        <div className="subheader ">
          <div className="container">
            <div className="landing-message text-center">
              <h1>Join Us</h1>
              <h3>
                We hire talented, driven people passionate about healthcare and
                technology.
              </h3>
            </div>
          </div>
        </div>

        <div id="grnhse_app" />

        <Footer />
      </div>
    );
  }
}
