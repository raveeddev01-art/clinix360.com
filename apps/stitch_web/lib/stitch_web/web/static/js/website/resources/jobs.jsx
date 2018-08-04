import React, { Component } from "react";

import TopBanner from "../components/top-banner";
import Header from "../components/header";
import Subheader from "../components/subheader";
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
      <div className="jobs-page">
        <TopBanner />
        <Header />

        <Subheader
          title="Join Us"
          subtitle="We hire talented, driven people passionate about healthcare and
          technology."
        />

        <div id="grnhse_app" />

        <Footer />
      </div>
    );
  }
}
