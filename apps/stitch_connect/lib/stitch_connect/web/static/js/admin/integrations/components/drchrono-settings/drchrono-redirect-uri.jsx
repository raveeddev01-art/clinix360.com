import React, { Component } from "react";
import { inject } from "mobx-react";

import FormControl from "react-bootstrap/lib/FormControl";
import ControlLabel from "react-bootstrap/lib/ControlLabel";

@inject("titleStore", "adminPanelStore", "groupsStore", "integrationStore")
export default class DrChronoRedirectUrl extends Component {
  get selectedIntegration() {
    return this.props.integrationStore.selectedIntegration;
  }

  get redirectUri() {
    const token = this.selectedIntegration.webhook_token;
    return `${applicationScheme}${applicationHost}/_oauth/drchrono/${token}`;
  }

  render() {
    return (
      <div>
        <ControlLabel>Your Redirect URI:</ControlLabel>
        <FormControl
          disabled
          name="redirectUri"
          id="redirectUri"
          type="text"
          value={this.redirectUri}
        />
      </div>
    );
  }
}
