import React, { Component } from "react";
import { inject } from "mobx-react";
import { Panel, Tabs, Tab } from "react-bootstrap";

import Subscription from "./subscription/Subscription";
import Contact from "./contact/Contact";
import Payment from "./payment/Payment";
import History from "./history/History";

const header = (
  <h1>
    <i className="fa fa-credit-card" /> Billing
  </h1>
);

@inject("titleStore", "adminPanelStore")
class TeamBilling extends Component {
  componentWillMount() {
    this.props.titleStore.setPageName("Billing");
    this.props.adminPanelStore.setHeading("Billing", "fa-credit-card");
  }

  render() {
    return (
      <Panel className="admin-panel tabs-panel" header={header}>
        <Tabs defaultActiveKey={1} id="admin-billing-tabs">
          <Tab eventKey={1} title="Subscription">
            <Subscription />
          </Tab>
          {/* <Tab eventKey={2} title="Contact">
            <Contact />
          </Tab>
          <Tab eventKey={3} title="Payment">
            <Payment />
          </Tab>
          <Tab eventKey={4} title="History">
            <History />
          </Tab> */}
        </Tabs>
      </Panel>
    );
  }
}

export default TeamBilling;
