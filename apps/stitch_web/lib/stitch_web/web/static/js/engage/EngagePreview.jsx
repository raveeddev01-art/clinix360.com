import React, { Component } from "react";
import { Helmet } from "react-helmet";
import cx from "classnames";

import { Switcher, AppAlert } from "common/components";
import EmptySidebar from "../common/components/sidebar/empty-sidebar";

import ModulePreview from "../common/components/module-preview/module-preview";

class EngagePreview extends Component {
  renderTagline() {
    return (
      <p>
        Engage your patients. <br />See more revenue.
      </p>
    );
  }

  renderDescription() {
    return (
      <p>
        Send messages, share files and start video calls directly with patients.
        Maximize return visits and referrals with our patient communication tool
        designed to help you deliver a phenomenal customer experience.
      </p>
    );
  }

  render() {
    return (
      <div id="app">
        <AppAlert />
        <div className={cx("appContainer", "engage-wrapper")}>
          <Helmet>
            <title>Engage</title>
          </Helmet>
          <Switcher />

          <EmptySidebar />

          <div className="engage-content">
            <ModulePreview
              tagLine={this.renderTagline()}
              moduleDescription={this.renderDescription()}
              requestUrl="https://teamstitch.typeform.com/to/Ncn8x8"
              iconClass="fa fa-bullhorn"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default EngagePreview;
