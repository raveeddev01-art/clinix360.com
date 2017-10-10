import React, { Component } from "react";
import { Panel, Tabs, Tab } from "react-bootstrap";
import TeamExport from "./export";
import TeamHipaa from "./hipaa";

const header = (
  <h1><i className="fa fa-shield"></i> Security</h1>
);

export default class TeamSecurity extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Panel className="admin-panel tabs-panel" header={header}>
        <Tabs defaultActiveKey={1} id="admin-security-tabs">
          <Tab eventKey={1} title="HIPAA">
            <TeamHipaa />
          </Tab>
          <Tab eventKey={2} title="Export">
            <TeamExport />
          </Tab>
        </Tabs>
      </Panel>
    );
  }
}
