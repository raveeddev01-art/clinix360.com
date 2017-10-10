import React, { Component } from "react";
import { Panel, Tabs, Tab } from "react-bootstrap";

const header = (
  <h1><i className="fa fa-credit-card"></i> Billing</h1>
);

export default class TeamBilling extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Panel className="admin-panel tabs-panel" header={header}>
        <Tabs defaultActiveKey={1} id="admin-billing-tabs">
          <Tab eventKey={1} title="Subscription">
            Subscription
          </Tab>
          <Tab eventKey={2} title="Contact">
            Contact
          </Tab>
          <Tab eventKey={3} title="Payment">
            Payment
          </Tab>
          <Tab eventKey={4} title="History">
            History
          </Tab>
        </Tabs>
      </Panel>
    );
  }
}
