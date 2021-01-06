import React, { Component } from "react";

export default class WindowsDesktop extends Component {
  render() {
    return (
      <div>
        <h5>
          <div className="card-description">
            Download the <strong>Linux desktop app</strong> to get the best
            experience using InvoCom.
          </div>
        </h5>

        <a
          disabled
          className="btn btn-primary btn-onboarding btn-lg btn-block m-b-40"
        >
          Coming Soon
        </a>
      </div>
    );
  }
}
