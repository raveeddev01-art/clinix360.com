import React, { Component } from "react";

import Tab from "react-bootstrap/lib/Tab";
import Nav from "react-bootstrap/lib/Nav";
import NavItem from "react-bootstrap/lib/NavItem";

import Header from "../components/header";
import Subheader from "../components/subheader";
import GetStarted from "../components/get-started";
import Footer from "../components/footer";

import PricingMobile from "./pricing-mobile";
import PricingDesktop from "./pricing-desktop";
import PricingEnterprise from "./pricing-enterprise";

export default class Pricing extends Component {
  componentDidMount() {
    analytics.track("Pricing Page Visited");
  }

  render() {
    return (
      <div className="pricing-page">
        <Header />

        <Subheader
          title="Set up your workspace, pay later"
          subtitle="Try InvoChat free for 14 days, no credit card required"
        />

        <div className="pricing-section">
          <div className="container">
            <Tab.Container id="pricing-tabs" defaultActiveKey="first">
              <div>
                <Nav bsStyle="tabs">
                  <NavItem eventKey="first">
                    {/* <span className="hidden-xs hidden-sm">InvoChat for</span>{" "}
                    InvoChat for Practices */}
                  </NavItem>
                </Nav>

                <Tab.Content animation unmountOnExit>
                  <Tab.Pane eventKey="first">
                    <h3 className="pricing-table-heading text-center">
                      <strong>InvoChat</strong> is a collaboration
                      space, tailored to fulfill needs of businesses of all scales.
                    </h3>
                    <div className="hidden-md hidden-lg">
                      <PricingMobile />
                    </div>

                    <div className="hidden-xs hidden-sm">
                      <PricingDesktop />
                    </div>
                  </Tab.Pane>

                  <Tab.Pane eventKey="second">
                    <PricingEnterprise />
                  </Tab.Pane>
                </Tab.Content>
              </div>
            </Tab.Container>
            {/* <Tab.Container id="pricing-tabs" defaultActiveKey="first">
              <div>
                <Nav bsStyle="tabs">
                  <NavItem eventKey="first">
                    <span className="hidden-xs hidden-sm">InvoChat for</span>{" "}
                    Practices
                  </NavItem>
                  <NavItem eventKey="second">
                    <span className="hidden-xs hidden-sm">InvoChat for</span>{" "}
                    Enterprise
                  </NavItem>
                </Nav>

                <Tab.Content animation unmountOnExit>
                  <Tab.Pane eventKey="first">
                    <h3 className="pricing-table-heading text-center">
                      <strong>InvoChat for Practices</strong> is a collaboration
                      space for small or medium sized InvoChat businesses.
                    </h3>
                    <div className="hidden-md hidden-lg">
                      <PricingMobile />
                    </div>

                    <div className="hidden-xs hidden-sm">
                      <PricingDesktop />
                    </div>
                  </Tab.Pane>

                  <Tab.Pane eventKey="second">
                    <PricingEnterprise />
                  </Tab.Pane>
                </Tab.Content>
              </div>
            </Tab.Container> */}
          </div>
        </div>

        <GetStarted />
        <Footer />
      </div>
    );
  }
}
