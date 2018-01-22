import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Panel, Tabs, Tab } from "react-bootstrap";

import Subscription from "./subscription/Subscription";
import Contact from "./contact/Contact";
import History from "./history/History";
import PaymentMethods from "./payment-methods/PaymentMethods";

@inject("titleStore", "adminPanelStore", "billingStore")
@observer
class TeamBilling extends Component {
  componentWillMount() {
    const { titleStore, adminPanelStore } = this.props;

    titleStore.setPageName("Billing");
    adminPanelStore.setHeading("Billing", "fa-credit-card");
  }

  render() {
    const { billingStore: { invoices } } = this.props;
    const header = (
      <h1>
        <i className="fa fa-credit-card" /> Billing
      </h1>
    );

    return (
      <Panel className="admin-panel tabs-panel" header={header}>
        <Tabs defaultActiveKey={1} id="admin-billing-tabs">
          <Tab eventKey={1} title="Subscription">
            <Subscription />
          </Tab>
          <Tab eventKey={2} title="Payment Methods">
            <PaymentMethods />
          </Tab>
          {invoices.length > 0 && (
            <Tab eventKey={3} title="History">
              <History />
            </Tab>
          )}
          <Tab eventKey={4} title="Contact">
            <Contact />
          </Tab>
        </Tabs>
      </Panel>
    );
  }
}

export default TeamBilling;
