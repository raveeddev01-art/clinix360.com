import React, { Component } from "react";

import CreateTeam from "./create-team";

export default class GetStartedCTA extends Component {
  render() {
    return (
      <div className="get-started">
        <div className="container">
          <div className="flex-box">
            <div className="flex-item">
              <h3>Get started for free</h3>
              <h4>Unlimited users, unlimited time.</h4>
            </div>

            <div className="flex-item ">
              <CreateTeam />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
