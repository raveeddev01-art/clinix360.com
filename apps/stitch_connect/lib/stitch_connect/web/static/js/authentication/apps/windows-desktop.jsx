import React, { Component } from "react";

export default class WindowsDesktop extends Component {
  render() {
    return (
      <div>
        <h5>
          Download the Windows desktop app to get the best experience using
          Stitch.
        </h5>

        <a
          href="https://s3.amazonaws.com/stitch-desktop/stitch-connect/Stitch+Setup+1.0.2.exe"
          className="btn btn-primary btn-lg btn-block m-b-20"
        >
          Download (32-bit)
        </a>

        <a
          href="https://s3.amazonaws.com/stitch-desktop/stitch-connect/Stitch+Setup+1.0.2.exe"
          className="btn btn-primary btn-lg btn-block m-b-40"
        >
          Download (64-bit)
        </a>
      </div>
    );
  }
}
