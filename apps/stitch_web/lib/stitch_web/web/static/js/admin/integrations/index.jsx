import React, { Component } from "react";
import { inject } from "mobx-react";
import Panel from "react-bootstrap/lib/Panel";
import Alert from "react-bootstrap/lib/Alert";

import IntegrationPanel from "./components/integration-panel";

const placeholderApps = [
  {
    slug: "athenahealth",
    name: "athenahealth",
    description:
      "athenahealth removes distractions that get in the way of care, with EHR, revenue cycle and population health services that improve clinical and financial results.",
    icon_url:
      "https://s3.amazonaws.com/stitch-content-public/ehr-logos/athenahealth.jpeg"
  },
  {
    slug: "epic",
    name: "Epic",
    description:
      "Founded in a basement in 1979, Epic develops software to help people get well, help people stay well, and help future generations be healthier.",
    icon_url:
      "https://s3.amazonaws.com/stitch-content-public/ehr-logos/Epic.png"
  },
  {
    slug: "Care Cloud",
    name: "CareCloud",
    description:
      "Innovative cloud-based practice management and EHR software, revenue cycle management and patient engagement.",
    icon_url:
      "https://s3.amazonaws.com/stitch-content-public/ehr-logos/CareCloud.png"
  },
  {
    slug: "cerner",
    name: "Cerner",
    description:
      "Cerner's health information and EHR technologies connect people, information and systems around the world. Serving the technology, clinical, financial and operational needs of health care organizations of every size.",
    icon_url:
      "https://s3.amazonaws.com/stitch-content-public/ehr-logos/Cerner.jpg"
  },
  {
    slug: "kareo",
    name: "Kareo",
    description:
      "Establish and grow a healthy practice with Kareo's Clinical, Billing, Managed Billing and Marketing modules.",
    icon_url:
      "https://s3.amazonaws.com/stitch-content-public/ehr-logos/Kareo.png"
  },
  {
    slug: "greenwayhealth",
    name: "Greenway Health",
    description:
      "We connect providers to the right information and insights, at the right place and time, so they can make patient-driven care a reality while navigating the ever-changing InvoChat system.",
    icon_url:
      "https://s3.amazonaws.com/stitch-content-public/ehr-logos/Greenway+Health.jpg"
  }
];

@inject("userStore", "titleStore", "adminPanelStore", "integrationStore")
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
