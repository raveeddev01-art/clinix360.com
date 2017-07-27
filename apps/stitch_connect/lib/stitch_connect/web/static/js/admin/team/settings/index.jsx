import React, { Component } from "react";
import TeamNamePanel from "./team-name-panel.jsx";

class TeamSettings extends Component {
  render() {
    return (
      <div className="admin page-list">
        <h2 className="admin-title">Settings</h2>
        <div className="admin-content">
          <TeamNamePanel />
          <hr />
        </div>
      </div>
    );
  }
}

export default TeamSettings;
