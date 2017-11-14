import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import browserDetails from "../../util/browser_details";
import WindowsDesktop from "./windows-desktop";
import MacDesktop from "./mac-desktop";
import LinuxDesktop from "./linux-desktop";
import IOSMobile from "./ios-mobile";
import AndroidMobile from "./android-mobile";

@inject("registrationStore", "titleStore")
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
    return <h2>{mobile ? "Mobile App" : "Desktop App"}</h2>;
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

          {os === "Windows" && !mobile && <WindowsDesktop />}

          {os === "Mac OS X" && !mobile && <MacDesktop />}

          {os === "Linux" && !mobile && <LinuxDesktop />}

          {os === "iOS" && mobile && <IOSMobile />}

          {os === "Android" && mobile && <AndroidMobile />}

          {!mobile && (
            <h5>
              Looking for web app?{" "}
              <a href="/">
                <strong>Skip & Launch</strong>
              </a>
            </h5>
          )}
        </div>

        {this.renderAlternateOS()}

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
      </div>
    );
  }
}
