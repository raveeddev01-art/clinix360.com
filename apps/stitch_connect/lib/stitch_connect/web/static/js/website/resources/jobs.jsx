import React, { Component } from "react";

import Header from "../components/header";
import Footer from "../components/footer";

export default class Jobs extends Component {
  componentWillMount() {
    const script = document.createElement("script");
    script.src = "https://boards.greenhouse.io/embed/job_board/js?for=stitch";
    script.async = true;
    document.body.appendChild(script);
  }

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
