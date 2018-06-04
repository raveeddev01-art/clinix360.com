import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

import { AuthenticationHeader } from "common/components";
import browserDetails from "../../lib/browser_details";
import WindowsDesktop from "./windows-desktop";
import MacDesktop from "./mac-desktop";
import LinuxDesktop from "./linux-desktop";
import IOSMobile from "./ios-mobile";
import AndroidMobile from "./android-mobile";

@inject("registrationStore", "invitationStore", "titleStore")
@observer
export default class DownloadApps extends Component {
  constructor(props) {
    super(props);

    const shouldRedirect =
      !!window.electronApp ||
      (browserDetails.mobile &&
        browserDetails.os !== "Android" &&
        browserDetails.os !== "iOS");

    this.state = {
      shouldRedirect,
      os: browserDetails.os,
      mobile: browserDetails.mobile
    };
    if (shouldRedirect) window.location.href = "/";
  }

  _changeOS = os => {
    this.setState({
      os
    });
  };

  renderHeader() {
    const { mobile } = browserDetails;
    return <h1>{mobile ? "Mobile App" : "Desktop App"}</h1>;
  }

  render() {
    const { shouldRedirect, os, mobile } = this.state;
    return (
      !shouldRedirect && (
        <div>
          <div className="authentication-card">
            <AuthenticationHeader type="no-cta" />
            <div className="authentication-body">
              {this.renderHeader()}

              {os === "Windows" && !mobile && <WindowsDesktop />}
              {os === "Mac OS X" && !mobile && <MacDesktop />}
              {os === "Linux" && !mobile && <LinuxDesktop />}
              {os === "iOS" && mobile && <IOSMobile />}
              {os === "Android" && mobile && <AndroidMobile />}
              {!mobile && (
                <HelpBlock className="onboarding-hint m-b-20 text-center">
                  or{" "}
                  <a href="/">
                    <strong>continue in the browser</strong>
                  </a>
                </HelpBlock>
              )}
            </div>
            <div className="authentication-spacer" />
          </div>
        </div>
      )
    );
  }
}
