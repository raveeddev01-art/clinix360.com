import React, { Component } from "react";

export default class WindowsDesktop extends Component {
  render() {
    return (
      <div>
        <h5>
          <div className="card-description">
            Download the <strong>Windows Desktop App</strong> to get the best
            experience using Stitch Connect.
          </div>
        </h5>

        <a
          href="https://teamstitch.com/download-win"
          className="btn btn-onboarding btn-primary btn-lg btn-block m-b-40"
        >
          Download the Windows App
        </a>
      </div>
    );
  }
}
