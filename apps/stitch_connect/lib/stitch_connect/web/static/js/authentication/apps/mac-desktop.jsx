import React, { Component } from "react";

export default class MacDesktop extends Component {
  render() {
    return (
      <div>
        <h5>
          Download the <strong>Mac desktop app</strong> to get the best
          experience using Stitch.
        </h5>

        <a
          href="https://teamstitch.com/download-mac"
          className="btn btn-onboarding btn-primary btn-lg btn-block m-b-40"
          alt="Download Stitch on iTunes store"
        >
          Download the Mac App
        </a>
      </div>
    );
  }
}
