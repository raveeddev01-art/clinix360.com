import React, { Component } from "react";

import CreateTeam from "./create-team";

import browserDetails from "../../lib/browser_details";

export default class GetStarted extends Component {
  render() {
    const { mobile, os } = browserDetails;

    return (
      <div className="get-started">
        <div className="container">
          <div className="flex-box">
            <div className="flex-item">
              <h3>Get started for free</h3>
              <h4>Unlimited users, unlimited time.</h4>
            </div>

            <div className="flex-item ">
              {!mobile && <CreateTeam />}

              {mobile &&
                os === "iOS" && (
                  <a
                    href="http://stitch.app.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary appstore-btn"
                  >
                    Get Stitch for iOS
                  </a>
                )}

              {mobile &&
                os === "Android" && (
                  <a
                    href="http://stitch.app.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary appstore-btn"
                  >
                    Get Stitch for Android
                  </a>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
