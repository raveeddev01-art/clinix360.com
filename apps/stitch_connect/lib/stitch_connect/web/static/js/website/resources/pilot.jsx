import React, { Component } from "react";
import { Link } from "react-router-dom";

import Header from "../components/header";
import GetStarted from "../components/get-started";
import Footer from "../components/footer";

import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Panel from "react-bootstrap/lib/Panel";

export default class Pilot extends Component {
  render() {
    return (
      <div>
        <Header />

        <div className="subheader">
          <div className="container">
            <div className="landing-message text-center">
              <h1>Pilot Program</h1>
              <h3>Structured pilot programs for healthcare enterprises</h3>
            </div>
          </div>
        </div>

        <div className="pilot-page text-center">
          <div className="pilot-section">
            <div className="container">
              <h3 className="m-b-30">
                Major healthcare organizations succeed with Stitch
              </h3>

              <Row>
                <Col sm={4}>
                  <i className="fa fa-building-o" />
                  <h4>Scalability</h4>
                  <p>
                    Everyone claims it but few can do it. Scalability is in the
                    Stitch DNA: we’re powered by Erlang & Elixir, the core
                    technology used in two-thirds of the world’s most fault
                    tolerant telecommunications systems. Our battle-tested
                    approach scales for teams of 100,000+ users.
                  </p>
                </Col>

                <Col sm={4}>
                  <i className="fa fa-shield" />
                  <h4>Security</h4>
                  <p>
                    Our rigorous security program touches every aspect of HIPAA:
                    physical, technical & administrative safeguards. From data
                    encryption to audit logs, device lockout to compliance
                    exports, and BAAs to SLAs, we cover large enterprises at
                    every turn. Find out more{" "}
                    <a
                      href="https://intercom.help/teamstitch/manage/security/hipaa-compliance"
                      target="_blank"
                    >
                      here
                    </a>.
                  </p>
                </Col>

                <Col sm={4}>
                  <i className="fa fa-sliders" />
                  <h4>Control</h4>
                  <p>
                    Complex healthcare organizations require powerful and
                    efficient administrative oversight. Stitch provides an
                    enterprise-grade admin panel for user provisioning,
                    permissions controls, group management, data retention
                    policies and detailed analytics reports.
                  </p>
                </Col>
              </Row>
            </div>
          </div>

          <div className="pilot-section">
            <div className="container">
              <h3 className="m-b-30">How the pilot program works</h3>

              <p>
                Deploying new technology is challenging for complex healthcare
                enterprises. Approval, procurement and adoption on an
                organization-wide scale can be accelerated by a strong pilot
                performance. Stitch’s Pilot Program is a defined, streamlined
                process for introducing Stitch to your enterprise.
              </p>

              <Row>
                <Col sm={4}>
                  <div className="icon-holder">
                    <div className="icon-line-empty hidden-xs" />
                    <div className="icon-circle">
                      <i className="fa fa-th-list" />
                    </div>
                    <div className="icon-line hidden-xs" />
                  </div>

                  <h4 className="text-uppercase m-b-20">Scope</h4>
                  <p>
                    Define the success criteria. We’ll work with your
                    organization to understand the key objectives in
                    implementing Stitch and delineate goals for ROI.
                  </p>
                </Col>

                <Col sm={4}>
                  <div className="icon-holder">
                    <div className="icon-line hidden-xs" />
                    <div className="icon-circle">
                      <i className="fa fa-bullhorn" />
                    </div>
                    <div className="icon-line hidden-xs" />
                  </div>

                  <h4 className="text-uppercase m-b-20">Deploy</h4>
                  <p>
                    Select a target department or team to pilot Stitch for a
                    defined time period. We’ll assist with on-site deployment
                    and 24/7 support during the pilot.
                  </p>
                </Col>

                <Col sm={4}>
                  <div className="icon-holder">
                    <div className="icon-line hidden-xs" />
                    <div className="icon-circle">
                      <i className="fa fa-bar-chart" />
                    </div>
                    <div className="icon-line-empty hidden-xs" />
                  </div>

                  <h4 className="text-uppercase m-b-20">Access</h4>
                  <p>
                    Use our advanced analytics tools to view detailed usage and
                    ROI reports. Understand exactly where and how Stitch makes
                    an impact in your organization.
                  </p>
                </Col>
              </Row>
            </div>
          </div>

          <div className="pilot-section">
            <div className="container">
              <h3 className="m-b-30">Why organizations pilot Stitch</h3>

              <Row>
                <Col sm={4}>
                  <Panel>
                    <h4>Custom Implementation</h4>
                    <hr />
                    <p>
                      Your organization is unique. New programs are more likely
                      to succeed when specifically built to match your team’s
                      needs.
                    </p>
                  </Panel>
                </Col>

                <Col sm={4}>
                  <Panel>
                    <h4>Streamlined Adoption</h4>
                    <hr />
                    <p>
                      Create a fast-track to organization-wide rollout with a
                      strong pilot performance. Our ROI reports will do the work
                      for you.
                    </p>
                  </Panel>
                </Col>

                <Col sm={4}>
                  <Panel>
                    <h4>Usage Derisking</h4>
                    <hr />
                    <p>
                      Know you’ll win before you fight the battle. Gain
                      confidence by watching Stitch succeed at your own
                      organization.
                    </p>
                  </Panel>
                </Col>
              </Row>
            </div>
          </div>
        </div>

        <GetStarted />
        <Footer />
      </div>
    );
  }
}
