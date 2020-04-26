import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import Panel from "react-bootstrap/lib/Panel";
import HomeItem from "../admin/you/home/home-item";

@inject("currentPatientStore")
@observer
class PatientHome extends Component {
  render() {
    const { currentPatientStore } = this.props;
    const welcomeMsg = `Welcome, ${currentPatientStore.firstName}!`;

    return (
      <div className="admin-content">
        <div className="flex-header admin-topbar">
          <h4>
            <span>
              <i className="fa fa-home" /> Home
            </span>
          </h4>
        </div>
        <div className="admin-content-wrapper">
          <Panel className="admin-panel home-panel">
            <Panel.Heading>
              <h1>{welcomeMsg}</h1>
            </Panel.Heading>

            <Panel.Body>
              <div className="admin-admin-wrapper">
                <HomeItem
                  icon="fa-comment"
                  title="Messages"
                  description="View and send secure messages to your provider."
                  openButtonText="Open"
                  link="/patient/conversations"
                />
                <HomeItem
                  icon="fa-user"
                  title="Profile"
                  description="Update your account and health information."
                  openButtonText="Open"
                  link="/patient/profile"
                />
                <HomeItem
                  icon="fa-question"
                  title="Help"
                  description="Articles and guides on how to use Stitch."
                  openButtonText="Open"
                  link="https://help.dvlcloud.com"
                  newTab
                />
              </div>
            </Panel.Body>
          </Panel>
        </div>
      </div>
    );
  }
}

export default PatientHome;
