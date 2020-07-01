import React, { Component } from "react";

export default class AndroidMobile extends Component {
  render() {
    return (
      <div>
        <h5>
          <div className="card-description">
            Download the <strong>Android Mobile App</strong> to get the best
            experience using Clinix360.
          </div>
        </h5>

        <a
          href="https://play.google.com/store/apps/details?id=com.teamstitch.stitch_connect&hl=en"
          className="btn m-b-40"
        >
          <img
            src="/images/playstore.png"
            className="img-responsive"
            alt="Download Clinix360 on Play store"
          />
        </a>
      </div>
    );
  }
}
