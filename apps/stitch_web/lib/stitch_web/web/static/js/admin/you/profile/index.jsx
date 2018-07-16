import React, { Component } from "react";
import { inject } from "mobx-react";
import Panel from "react-bootstrap/lib/Panel";
import pick from "lodash/pick";

import withAlertState from "../../../util/with_alert_state";
import NamePanel from "./name-panel";
import PhoneNumberPanel from "./phone-number-panel";
import TitlePanel from "./title-panel";
import ProfileImagePanel from "./profile-image-panel";

@inject("titleStore", "adminPanelStore")
@withAlertState
class ProfileSettings extends Component {
  componentWillMount() {
    this.props.titleStore.setPageName("Profile");
    this.props.adminPanelStore.setHeading("Profile", "fa-user");
  }

  render() {
    const commonPanelProps = pick(this, "onSuccess", "onError", "hideAlert");

    return (
      <Panel className="admin-panel">
        <Panel.Heading>
          <h1>
            <i className="fa fa-user" /> Profile
          </h1>
        </Panel.Heading>

        <Panel.Body>
          {this.renderAlert()}
          <NamePanel {...commonPanelProps} />
          <PhoneNumberPanel {...commonPanelProps} />
          <TitlePanel {...commonPanelProps} />
          <ProfileImagePanel {...commonPanelProps} />
        </Panel.Body>
      </Panel>
    );
  }
}

export default ProfileSettings;
