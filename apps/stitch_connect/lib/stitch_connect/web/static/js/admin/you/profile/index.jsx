import React, { Component } from "react";
import Panel from "react-bootstrap/lib/Panel";
import NamePanel from "./name-panel.jsx";
import PhoneNumberPanel from "./phone-number-panel.jsx";
import TitlePanel from "./title-panel.jsx";
import ProfileImagePanel from "./profile-image-panel.jsx";

class ProfileSettings extends Component {
  render() {
    return (
      <Panel className="admin-panel">
        <h1 className="admin-title text-center">Profile</h1>
        <NamePanel />
        <hr />
        <PhoneNumberPanel />
        <hr />
        <TitlePanel />
        {/* <hr />
        <ProfileImagePanel /> */}
      </Panel>
    );
  }
}

export default ProfileSettings;
