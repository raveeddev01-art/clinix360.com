import React, { Component } from "react";

import TopBanner from "../components/top-banner";
import Header from "../components/header";
import Subheader from "../components/subheader";
import GetStarted from "../components/get-started";
import Footer from "../components/footer";

import PricingMobile from "./pricing-mobile";
import PricingDesktop from "./pricing-desktop";

export default class Pricing extends Component {
  componentDidMount() {
    analytics.track("Pricing Page Visited");
  }

  render() {
    return (
      <div className="pricing-page">
        <TopBanner />
        <Header />

        <Subheader
          title="Free to use, upgrade any time"
          subtitle="Stitch Connect is free to use with an unlimited number of people."
        />

        <div className="pricing-section">
          <div className="container">
            <div className="hidden-md hidden-lg">
              <PricingMobile />
            </div>

            <div className="hidden-xs hidden-sm">
              <PricingDesktop />
            </div>

            <h4 className="text-center m-b-0 enterprise-text">
              Need to deploy Stitch across a large organization?{" "}
              <a href="mailto:support@teamstitch.com">Contact us</a> for
              Enterprise pricing.
            </h4>
          </div>
        </div>

        <GetStarted />
        <Footer />
      </div>
    );
  }
}
