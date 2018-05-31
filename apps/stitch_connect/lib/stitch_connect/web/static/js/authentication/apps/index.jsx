import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

import browserDetails from "../../lib/browser_details";
import WindowsDesktop from "./windows-desktop";
import MacDesktop from "./mac-desktop";
import LinuxDesktop from "./linux-desktop";
import IOSMobile from "./ios-mobile";
import AndroidMobile from "./android-mobile";
import MinimalHeader from "../components/header/minimal_header";

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

  renderAlternateOS() {
    const { os, mobile } = this.state;
    const macButton = (
      <a onClick={() => this._changeOS("Mac OS X")}>
        <strong>Mac</strong>
      </a>
    );
    const winButton = (
      <a onClick={() => this._changeOS("Windows")}>
        <strong>Windows</strong>
      </a>
    );
    const linuxButton = (
      <a onClick={() => this._changeOS("Linux")}>
        <strong>Linux</strong>
      </a>
    );
    if (!mobile) {
      if (os === "Mac OS X") {
        return (
          <h5>
            Looking for {winButton} or {linuxButton} desktop apps?
          </h5>
        );
      } else if (os === "Windows") {
        return (
          <h5>
            Looking for {macButton} or {linuxButton} desktop apps?
          </h5>
        );
      } else if (os === "Linux") {
        return (
          <h5>
            Looking for {macButton} or {winButton} desktop apps?
          </h5>
        );
      }
    }

    return null;
  }

  render() {
    const { shouldRedirect, os, mobile } = this.state;
    return (
      !shouldRedirect && (
        <div className="authentication-card m-b-20">
          <MinimalHeader type="no-cta" />

          <div className="authentication-body">
            {this.renderHeader()}

            {os === "Windows" && !mobile && <WindowsDesktop />}
            {os === "Mac OS X" && !mobile && <MacDesktop />}
            {os === "Linux" && !mobile && <LinuxDesktop />}
            {os === "iOS" && mobile && <IOSMobile />}
            {os === "Android" && mobile && <AndroidMobile />}
            {!mobile && (
              <HelpBlock className="onboarding-hint m-b-20">
                or{" "}
                <a href="/">
                  <strong>continue in the browser</strong>
                </a>
              </HelpBlock>
            )}
          </div>

          <div className="authentication-footer">
            <HelpBlock className="onboarding-hint m-b-20">
              {this.renderAlternateOS()}
            </HelpBlock>
          </div>
        </div>
      )
    );
  }
}
