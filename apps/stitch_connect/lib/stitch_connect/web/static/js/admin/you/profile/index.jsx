import React, { Component } from "react";
import { inject } from "mobx-react";
import Panel from "react-bootstrap/lib/Panel";
import Alert from "react-bootstrap/lib/Alert";

import NamePanel from "./name-panel";
import PhoneNumberPanel from "./phone-number-panel";
import TitlePanel from "./title-panel";
// import ProfileImagePanel from "./profile-image-panel";

const header = (
  <h1>
    <i className="fa fa-user" /> Profile
  </h1>
);

@inject("titleStore", "adminPanelStore")
class ProfileSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      alertMessage: "",
      alertStyle: "",
      alertVisible: false
    };
  }

  componentWillMount() {
    this.props.titleStore.setPageName("Profile");
    this.props.adminPanelStore.setHeading("Profile", "fa-user");
  }

  onSuccess = message => {
    this.setState({
      alertMessage: message,
      alertVisible: true,
      alertStyle: "success"
    });
  };

  onError = message => {
    this.setState({
      alertMessage: message,
      alertVisible: true,
      alertStyle: "danger"
    });
  };

  hideAlert = () => {
    this.setState({
      alertVisible: false
    });
  };

  render() {
    const { alertMessage, alertVisible, alertStyle } = this.state;

    return (
      <Panel className="admin-panel" header={header}>
        {alertVisible && <Alert bsStyle={alertStyle}>{alertMessage}</Alert>}
        <NamePanel
          onSuccess={this.onSuccess}
          onError={this.onError}
          hideAlert={this.hideAlert}
        />
        <PhoneNumberPanel
          onSuccess={this.onSuccess}
          onError={this.onError}
          hideAlert={this.hideAlert}
        />
        <TitlePanel
          onSuccess={this.onSuccess}
          onError={this.onError}
          hideAlert={this.hideAlert}
        />
        {/* <ProfileImagePanel /> */}
      </Panel>
    );
  }
}

export default ProfileSettings;
