import React, { Component } from "react";

export default class AndroidMobile extends Component {
  render() {
    return (
      <div>
        <h5>
          Download the <strong>Android mobile app</strong> to get the best
          experience using Stitch.
        </h5>

        <a
          href="https://play.google.com/store/apps/details?id=com.teamstitch.stitch_connect&hl=en"
          className="btn m-b-40"
        >
          <img
            src="/images/playstore.png"
            className="img-responsive"
            alt="Download Stitch on Play store"
          />
        </a>
      </div>
    );
  }
}
