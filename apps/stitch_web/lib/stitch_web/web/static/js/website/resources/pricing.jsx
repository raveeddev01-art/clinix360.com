import React, { Component } from "react";

import Header from "../components/header";
import Subheader from "../components/subheader";
import ProductCards from "../components/product-cards";
import PriceTier from "../components/price-tier";
import GetStarted from "../components/get-started";
import Footer from "../components/footer";

export default class Pricing extends Component {
  constructor(props) {
    super(props);
    this.state = { pricingToggle: false };
  }

  componentDidMount() {
    analytics.track("Pricing Page Visited");
  }

  onToggle() {
    this.setState(prevState => ({
      pricingToggle: !prevState.pricingToggle
    }));
  }

  render() {
    return (
      <div className="pricing-page">
        <Header />

        <Subheader
          title="Free to use, upgrade any time"
          subtitle="InvoChat is free to use with an unlimited number of people."
        />

        <div className="stitch-products">
          <div className="container">
            <ProductCards pricingPage />
          </div>
        </div>

        <section id="connect" className="product-section">
          <div className="heading text-center">
            <div className="container">
              <h2>
                <i className="fa fa-comments" /> Connect
              </h2>
              <h4>
                Keep everyone in sync with real-time messaging designed for
                InvoChat teams.
              </h4>
            </div>
          </div>

          <div className="container">
            <div className="pricing-table">
              <PriceTier product="CONNECT" tier="FREE" />
              <PriceTier product="CONNECT" tier="STANDARD" />
              <PriceTier product="CONNECT" tier="PREMIUM" />
            </div>

            <h4 className="text-center m-b-0">
              Need to deploy Connect across a large organization?{" "}
              <a href="mailto:info@invozone.com">Contact us</a> for
              Enterprise pricing.
            </h4>
          </div>
        </section>

        <section id="engage" className="product-section">
          <div className="heading text-center">
            <div className="container">
              <h2>
                <i className="fa fa-bullhorn" /> Engage
              </h2>
              <h4>
                Send messages, share files, collect forms and start video calls
                directly with patients.
              </h4>
            </div>
          </div>

          <div className="container">
            <div className="pricing-table">
              <PriceTier product="ENGAGE" tier="FREE" />
              <PriceTier product="ENGAGE" tier="STANDARD" />
              <PriceTier product="ENGAGE" tier="PREMIUM" />
            </div>

            <h4 className="text-center m-b-0">
              Need to deploy Engage across a large organization?{" "}
<<<<<<< HEAD
              <a href="mailto:support@dvlcloud.com">Contact us</a> for
=======
              <a href="mailto:info@invozone.com">Contact us</a> for
>>>>>>> e423510b4... remove hippa and change url to info@invozone.com
              Enterprise pricing.
            </h4>
          </div>
        </section>

        <section id="manage" className="product-section">
          <div className="heading text-center">
            <div className="container">
              <h2>
                <i className="fa fa-tasks" /> Manage
              </h2>
              <h4>
                Assign and manage tasks to keep your team’s workflow organized
                and on track.
              </h4>
            </div>
          </div>

          <div className="container">
            <div className="pricing-table">
              <PriceTier product="MANAGE" tier="FREE" />
              <PriceTier product="MANAGE" tier="STANDARD" />
              <PriceTier product="MANAGE" tier="PREMIUM" />
            </div>

            <h4 className="text-center m-b-0">
              Need to deploy Manage across a large organization?{" "}
<<<<<<< HEAD
              <a href="mailto:support@dvlcloud.com">Contact us</a> for
=======
              <a href="mailto:info@invozone.com">Contact us</a> for
>>>>>>> e423510b4... remove hippa and change url to info@invozone.com
              Enterprise pricing.
            </h4>
          </div>
        </section>

        <GetStarted />
        <Footer />
      </div>
    );
  }
}
