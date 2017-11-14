import React, { Component } from "react";

export default class IOSMobile extends Component {
  render() {
    return (
      <div>
        <h5 className="m-b-40">
          Download the iOS mobile app to get the best experience using Stitch.
        </h5>

        <a
          href="https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=1299521330&mt=8"
          className="btn m-b-40"
        >
          <img
            src="/images/appstore.png"
            alt="Download Stitch on iTunes store"
          />
        </a>
      </div>
    );
  }
}
