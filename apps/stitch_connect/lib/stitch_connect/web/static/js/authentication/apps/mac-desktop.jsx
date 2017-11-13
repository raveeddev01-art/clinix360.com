import React, { Component } from "react";

export default class MacDesktop extends Component {
  render() {
    return (
      <div>
        <h5>
          Download the Mac desktop app to get the best experience using Stitch.
        </h5>

        <a
          href="https://s3.amazonaws.com/stitch-desktop/stitch-connect/Stitch-1.0.2.dmg"
          className="btn btn-primary btn-lg btn-block m-b-40"
          alt="Download Stitch on iTunes store"
        >
          Download
        </a>
      </div>
    );
  }
}
