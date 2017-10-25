import React, { Component } from "react";
import Panel from "react-bootstrap/lib/Panel";
import { inject } from "mobx-react";
import NamePanel from "./name-panel";
import PhoneNumberPanel from "./phone-number-panel";
import TitlePanel from "./title-panel";
// import ProfileImagePanel from "./profile-image-panel";

const header = (
  <h1>
    <i className="fa fa-user" /> Profile
  </h1>
);

@inject("titleStore")
class ProfileSettings extends Component {
  componentWillMount() {
    this.props.titleStore.setPageName("Profile");
  }

  render() {
    return (
      <Panel className="admin-panel" header={header}>
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
