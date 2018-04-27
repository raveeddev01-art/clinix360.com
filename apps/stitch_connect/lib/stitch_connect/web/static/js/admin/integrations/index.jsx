import React, { Component } from "react";
import { inject } from "mobx-react";
import Panel from "react-bootstrap/lib/Panel";
import Alert from "react-bootstrap/lib/Alert";

import IntegrationPanel from "./components/integration-panel";

const placeholderApps = [
  {
    slug: "athenahealth",
    name: "Athena Health",
    description: "Athena Health app",
    icon: "https://placehold.it/50x50"
  },
  {
    slug: "epic",
    name: "epic",
    description: "Epic app",
    icon: "https://placehold.it/50x50"
  },
  {
    slug: "Care Cloud",
    name: "carecloud",
    description: "Care Cloud app",
    icon: "https://placehold.it/50x50"
  },
  {
    slug: "Cerner",
    name: "cerner",
    description: "Cerner app",
    icon: "https://placehold.it/50x50"
  },
  {
    slug: "Kareo",
    name: "kareo",
    description: "Kareo app",
    icon: "https://placehold.it/50x50"
  },
  {
    slug: "greenwayhealth",
    name: "Greenway Health",
    description: "Greenway Health app",
    icon: "https://placehold.it/50x50"
  }
];

@inject("userStore", "titleStore", "adminPanelStore", "integrationStore")
class Integrations extends Component {
  constructor(props) {
    super(props);
  }

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
          {this.props.integrationStore.apps.map(app => (
            <IntegrationPanel
              key={`app-${app.slug}`}
              title={app.name}
              slug={app.slug}
              description={app.description}
              icon={app.icon_url}
            />
          ))}

          {placeholderApps.map(app => (
            <IntegrationPanel
              key={`app-${app.slug}`}
              title={app.name}
              slug={app.slug}
              description={app.description}
              icon={app.icon_url}
              requestAccess
            />
          ))}
        </Panel.Body>
      </Panel>
    );
  }
}

export default Integrations;
