import React, { Component } from "react";
import cx from "classnames";

import CreateTeam from "./create-team";

export default class GetStartedCTA extends Component {
  render() {
    const getStartedClass = cx("get-started", {
      "logged-in": appSettings.hasLogin
    });

    const boxClass = cx("flex-box", {
      "logged-in": appSettings.hasLogin
    });

    const itemClass = cx({
      "flex-item": !appSettings.hasLogin
    });

    return (
      <div className={getStartedClass}>
        <div className="container">
          <div className={boxClass}>
            <div className="flex-item">
              <h3>Get started for free</h3>
              <h4>Unlimited users, unlimited time.</h4>
            </div>

            <div className={itemClass}>
              <CreateTeam />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
