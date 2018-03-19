import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import Panel from "react-bootstrap/lib/Panel";
import Tab from "react-bootstrap/lib/Tab";
import Tabs from "react-bootstrap/lib/Tabs";

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

    return (
      <Panel className="admin-panel tabs-panel">
        <Panel.Heading>
          <h1>
            <i className="fa fa-credit-card" /> Billing
          </h1>
        </Panel.Heading>

        <Panel.Body>
          <Tabs defaultActiveKey={1} id="admin-billing-tabs" unmountOnExit>
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
        </Panel.Body>
      </Panel>
    );
  }
}

export default TeamBilling;
