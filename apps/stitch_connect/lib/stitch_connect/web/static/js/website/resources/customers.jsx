import React, { Component } from "react";
import { Link } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import cx from "classnames";

import Header from "../components/header";
import CUSTOMERS from "../components/customers-logos";
import GetStarted from "../components/get-started";
import Footer from "../components/footer";

import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import ResponsiveEmbed from "react-bootstrap/lib/ResponsiveEmbed";
import Panel from "react-bootstrap/lib/Panel";
import Button from "react-bootstrap/lib/Button";

export default class Customers extends Component {
  renderCustomers() {
    return CUSTOMERS.map((c, index) => {
      const className = cx("col-lg-5ths col-md-3 col-xs-4", {
        "visible-lg": index % 5 === 4
      });
      return (
        <div className={className} key={`customer_${index}`}>
          <img src={c.img} alt={c.title} />
        </div>
      );
    });
  }

  render() {
    return (
      <div>
        <Header />
        <div className="customers-page">
          <div className="subheader ">
            <div className="container">
              <div className="landing-message text-center">
                <h1>Customers</h1>
                <h3>
                  See how customers have improved care coordination on our
                  platform.
                </h3>
              </div>
            </div>
          </div>

          <section>
            <div className="container">
              <Panel className="luminance-card">
                <div className="flex-box">
                  <div className="flex-item">
                    <h2 className="m-b-20">Luminance Recovery</h2>

                    <p className="m-b-20">
                      Luminance Recovery is a residential drug addiction
                      treatment and rehabilitation center. Their approach
                      integrates a personalized treatment plan for every
                      patient. Treatment begins with detox, which includes
                      24-hour care, stabilization, and medical attention for
                      discomfort and withdrawal. After detox, clients move to
                      the next phase of recovery: a 30, 60, or 90-day inpatient
                      recovery program. Luminance adopted Stitch to help improve
                      critical communications and keep clients in the recovery
                      program.
                    </p>

                    <LinkContainer to="/customers/luminance-recovery">
                      <Button bsStyle="primary" bsSize="lg" block>
                        Read More
                      </Button>
                    </LinkContainer>
                  </div>

                  <div className="flex-item">
                    <ResponsiveEmbed a16by9>
                      <embed src="https://www.youtube.com/embed/v1fjEFYMiyA?rel=0" />
                    </ResponsiveEmbed>
                  </div>
                </div>
              </Panel>
            </div>
          </section>

          <div className="our-customers text-center">
            <div className="container">
              <h3 className="text-center m-b-20">
                Thousands of healthcare providers are improving patient care
                through Stitch. <br /> Join the movement.
              </h3>
              <div className="customer-logos">
                <div className="row logo-row">{this.renderCustomers()}</div>
              </div>
            </div>
          </div>

          <section className="customer-studies text-center">
            <div className="container">
              <h3 className="m-b-50">
                Learn how all kinds of healthcare teams use Stitch every day.
              </h3>

              <div className="flex-box">
                <div className="flex-item">
                  <Panel className="pbs-card m-b-30">
                    <img src="/images/customer-pbsc.png" alt="" />
                    <h4 className="m-b-20">Princeton Brain & Spine</h4>
                    <p className="m-b-30">
                      Princeton Brain & Spine is one of America's leading
                      neurosurgical practices. As a multi-site practice
                      coordinating patient care, Princeton Brain & Spine sought
                      out Stitch to improve the collaboration between providers
                      in different locations.
                    </p>

                    <LinkContainer to="/customers/princeton-brain-spine">
                      <Button bsStyle="primary" bsSize="lg" block>
                        Read More
                      </Button>
                    </LinkContainer>
                  </Panel>
                </div>

                <div className="flex-item">
                  <Panel className="m-b-30">
                    <img src="/images/customer-dssi.png" alt="" />
                    <h4 className="m-b-20">
                      Dermatology & Skin Surgery Institute
                    </h4>
                    <p className="m-b-30">
                      DSSI provides state-of-the-art procedures for skin cancer
                      removal, microscopic tissue analysis, and advanced
                      reconstructive techniques. The team used Stitch to sync
                      providers and staff during patient consultations for
                      improved efficiency and care.
                    </p>

                    <LinkContainer to="/customers/dermatology-skin-surgery-institute">
                      <Button bsStyle="primary" bsSize="lg" block>
                        Read More
                      </Button>
                    </LinkContainer>
                  </Panel>
                </div>
              </div>

              <div className="flex-box">
                <div className="flex-item">
                  <Panel className="m-b-30">
                    <img src="/images/customer-citywide.png" alt="" />
                    <h4 className="m-b-20">UCSF Citywide</h4>
                    <p className="m-b-30">
                      Citywide Case Management is a division of UCSF's
                      Department of Psychiatry. The multidisciplinary staff
                      provide comprehensive and continuous services to 200
                      severely mentally ill adults. Citywide sought Stitch to
                      manage field communication during client work.
                    </p>

                    <LinkContainer to="/customers/UCSF-citywide">
                      <Button bsStyle="primary" bsSize="lg" block>
                        Read More
                      </Button>
                    </LinkContainer>
                  </Panel>
                </div>

                <div className="flex-item">
                  <Panel className="m-b-30">
                    <img src="/images/customer-orchard.png" alt="" />
                    <h4 className="m-b-20">Orchard Medical Associates</h4>
                    <p className="m-b-30">
                      Orchard Medical Associates is a primary care practice
                      focused on expert medical care and attentive disease
                      prevention. By adopting Stitch, Orchard Medical was able
                      to rapidly integrate a new tool to improve the flow of
                      patient care throughout the office.
                    </p>

                    <LinkContainer to="/customers/orchard-medical-associates">
                      <Button bsStyle="primary" bsSize="lg" block>
                        Read More
                      </Button>
                    </LinkContainer>
                  </Panel>
                </div>
              </div>
            </div>
          </section>
        </div>

        <GetStarted />
        <Footer />
      </div>
    );
  }
}
