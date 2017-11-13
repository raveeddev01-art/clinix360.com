import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import browserDetails from "../../util/browser_details";
import WindowsDesktop from "./windows-desktop";
import MacDesktop from "./mac-desktop";
import IOSMobile from "./ios-mobile";
import AndroidMobile from "./android-mobile";

@inject("registrationStore", "titleStore")
@observer
export default class DownloadApps extends Component {
  constructor(props) {
    super(props);

    const shouldRedirect = window.electronApp || browserDetails.os === "Linux";
    this.state = {
      shouldRedirect
    };
    if (shouldRedirect) window.location.href = "/";
  }

  renderHeader() {
    const { mobile } = browserDetails;
    return <h2>{mobile ? "Mobile App" : "Desktop App"}</h2>;
  }

  render() {
    const { shouldRedirect } = this.state;
    return (
      <div>
        <div className="authentication-card text-center m-b-20">
          {shouldRedirect ? (
            <h3>Checking Available Apps</h3>
          ) : (
            this.renderHeader()
          )}

          <h5 className="text-muted url-heading">
            {this.props.registrationStore.teamSlug}.teamstitch.com
          </h5>

          {browserDetails.os === "Windows" &&
            !browserDetails.mobile && <WindowsDesktop />}

          {browserDetails.os === "Mac OS X" &&
            !browserDetails.mobile && <MacDesktop />}

          {browserDetails.os === "iOS" &&
            browserDetails.mobile && <IOSMobile />}

          {browserDetails.os === "Android" &&
            browserDetails.mobile && <AndroidMobile />}

          <h5>
            Looking for web app?{" "}
            <a href="/">
              <strong>Skip & Launch</strong>
            </a>
          </h5>
        </div>

        <h5>
          Wrong team?{" "}
          <a href={`https://${applicationHost}/signin`}>
            <strong>Sign in to a different team</strong>
          </a>
        </h5>
        <h5>
          Just getting started?{" "}
          <a href={`https://${applicationHost}/signup/email`}>
            <strong>Create a new team</strong>
          </a>
        </h5>
        <h5>Looking for Mac desktop app?</h5>
      </div>
    );
  }
}
