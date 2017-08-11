import React, { Component } from "react";
import Panel from "react-bootstrap/lib/Panel";
import NamePanel from "./name-panel";
import PhoneNumberPanel from "./phone-number-panel";
import TitlePanel from "./title-panel";
import ProfileImagePanel from "./profile-image-panel";

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
