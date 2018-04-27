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
    icon_url:
      "https://s3.amazonaws.com/stitch-content-public/ehr-logos/athenahealth.jpeg"
  },
  {
    slug: "epic",
    name: "Epic",
    description: "Epic app",
    icon_url:
      "https://s3.amazonaws.com/stitch-content-public/ehr-logos/Epic.png"
  },
  {
    slug: "Care Cloud",
    name: "CareCloud",
    description: "Care Cloud app",
    icon_url:
      "https://s3.amazonaws.com/stitch-content-public/ehr-logos/CareCloud.png"
  },
  {
    slug: "cerner",
    name: "Cerner",
    description: "Cerner app",
    icon_url: "https://placehold.it/50x50"
  },
  {
    slug: "kareo",
    name: "Kareo",
    description: "Kareo app",
    icon_url:
      "https://s3.amazonaws.com/stitch-content-public/ehr-logos/Kareo.png"
  },
  {
    slug: "greenwayhealth",
    name: "Greenway Health",
    description: "Greenway Health app",
    icon_url:
      "https://s3.amazonaws.com/stitch-content-public/ehr-logos/Greenway+Health.jpg"
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
