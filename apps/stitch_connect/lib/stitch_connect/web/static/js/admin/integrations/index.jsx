import React, { Component } from "react";
import { inject } from "mobx-react";
import Panel from "react-bootstrap/lib/Panel";
import Alert from "react-bootstrap/lib/Alert";

import IntegrationPanel from "./components/integration-panel";

@inject("userStore", "titleStore", "adminPanelStore")
class Integrations extends Component {
  componentWillMount() {
    this.props.titleStore.setPageName("Integrations");
    this.props.adminPanelStore.setHeading("Integrations", "fa-database");
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
    return (
      <Panel className="admin-panel">
        <Panel.Heading>
          <h1>
            <i className="fa fa-database" /> Integrations
          </h1>
        </Panel.Heading>

        <Panel.Body>
          <IntegrationPanel
            title="drChrono"
            description="All-in-one practice management, electronic health records and billing solutions."
          />
        </Panel.Body>
      </Panel>
    );
  }
}

export default Integrations;
