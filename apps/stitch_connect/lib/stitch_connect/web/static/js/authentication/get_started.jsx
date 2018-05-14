import React, { Component } from "react";
import { Link } from "react-router-dom";

import Header from "./components/header/header";
import Footer from "./components/footer/footer";

export default class GetStarted extends Component {
  render() {
    return (
      <div>
        <Header />
        <div className="authentication-main">
          <div className="authentication-card text-center">
            <h2>Care Coordination</h2>

            <h4>
              Communicate, write notes, <br />track tasks, upload files, and{" "}
              <br />
              collaborate on any device.
            </h4>

            <Link to="/signin" className="btn btn-block btn-lg btn-primary">
              Sign In
            </Link>
            <Link
              to="/signup/email"
              className="btn btn-block btn-lg btn-default m-b-40"
            >
              Get Started
            </Link>
          </div>
        </div>
        {!window.electronApp && <Footer />}
      </div>
    );
  }
}
