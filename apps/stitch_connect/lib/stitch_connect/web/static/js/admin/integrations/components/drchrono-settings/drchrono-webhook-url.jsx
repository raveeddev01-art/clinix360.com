import React, { Component } from "react";
import { inject } from "mobx-react";

import FormControl from "react-bootstrap/lib/FormControl";
import ControlLabel from "react-bootstrap/lib/ControlLabel";

@inject("titleStore", "adminPanelStore", "groupsStore", "integrationStore")
export default class DrChronoWebhookUrl extends Component {
  get selectedIntegration() {
    return this.props.integrationStore.selectedIntegration;
  }

  get webhookUrl() {
    const token = this.selectedIntegration.webhook_token;
    return `${applicationScheme}${applicationHost}/webhook/drchrono/${token}`;
  }

  render() {
    return (
      <div>
        <ControlLabel>Your Webhook URL:</ControlLabel>
        <FormControl
          disabled
          name="webhookToken"
          id="webhookToken"
          type="text"
          value={this.webhookUrl}
        />
      </div>
    );
  }
}
