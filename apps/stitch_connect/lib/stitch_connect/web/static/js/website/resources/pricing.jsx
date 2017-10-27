import React, { Component } from "react";
import { Link } from "react-router-dom";

import Tabs from "react-bootstrap/lib/Tabs";
import Tab from "react-bootstrap/lib/Tab";
import Nav from "react-bootstrap/lib/Nav";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import NavItem from "react-bootstrap/lib/NavItem";

export default class Pricing extends Component {
  constructor(props) {
    super(props);
    this.state = { pricingToggle: true };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(prevState => ({
      pricingToggle: !prevState.pricingToggle
    }));
  }

  render() {
    return (
      <div>
        <div className="subheader">
          <div className="container">
            <div className="landing-message text-center">
              <h1>Pricing</h1>
              <h3>Free to start, upgrade when you need.</h3>
            </div>
          </div>
        </div>

        <div className="pricing">
          <div className="container">
            <Tab.Container id="left-tabs-example" defaultActiveKey="first">
              <Row className="clearfix">
                <Col xs={12}>
                  <Nav bsStyle="tabs" justified>
                    <NavItem eventKey="first">
                      <img
                        src="/images/connect-icon.png"
                        alt="Stitch Connect"
                        className="m-b-10"
                      />
                      <h3>Connect</h3>
                      <h4>Team Messaging</h4>
                    </NavItem>

                    <NavItem eventKey="second">
                      <img
                        src="/images/engage-icon.png"
                        alt="Stitch Connect"
                        className="m-b-10"
                      />
                      <h3>Engage</h3>
                      <h4>Patient Messaging</h4>
                    </NavItem>

                    <NavItem eventKey="third">
                      <img
                        src="/images/manage-icon.png"
                        alt="Stitch Connect"
                        className="m-b-10"
                      />
                      <h3>Manage</h3>
                      <h4>Patient Management</h4>
                    </NavItem>
                  </Nav>
                </Col>

                <Col xs={12}>
                  <Tab.Content animation>
                    <Tab.Pane eventKey="first">
                      <Row>
                        <Col xs={4}>
                          <div className="plan text-center">
                            <h3>Basic</h3>
                            <div className="price">
                              <sup>$</sup>
                              {this.state.pricingToggle ? "6" : "5"}
                            </div>
                            <div className="price-details">
                              per user per month <br /> billed{" "}
                              <span onClick={this.handleClick}>
                                {this.state.pricingToggle
                                  ? "monthly"
                                  : "annually"}
                              </span>
                            </div>

                            <ul className="list-unstyled text-left plan-features">
                              <li>
                                <i className="fa fa-check-circle-o" />HIPAA
                                Compliant
                              </li>
                              <li>
                                <i className="fa fa-check-circle-o" />Group &
                                Direct Messaging
                              </li>
                              <li>
                                <i className="fa fa-check-circle-o" />Healthcare
                                Workflows
                              </li>
                              <li>
                                <i className="fa fa-check-circle-o" />Searchable
                                Archives
                              </li>
                              <li>
                                <i className="fa fa-check-circle-o" />File
                                Storage
                              </li>
                              <li>
                                <i className="fa fa-check-circle-o" />Mac &
                                Windows Apps
                              </li>
                              <li>
                                <i className="fa fa-check-circle-o" />iOS &
                                Android Apps
                              </li>
                            </ul>
                          </div>
                        </Col>

                        <Col xs={4}>
                          <div className="plan text-center">
                            <h3>Premium</h3>
                            <div className="price">
                              <sup>$</sup>
                              {this.state.pricingToggle ? "12" : "10"}
                            </div>
                            <div className="price-details">
                              per user per month <br /> billed{" "}
                              <span onClick={this.handleClick}>
                                {this.state.pricingToggle
                                  ? "monthly"
                                  : "annually"}
                              </span>
                            </div>

                            <ul className="list-unstyled text-left plan-features">
                              <li>
                                <i className="fa fa-check-circle-o" />
                                <em>
                                  All features from <strong>Basic</strong>
                                </em>
                              </li>
                              <li>
                                <i className="fa fa-check-circle-o" />Task
                                Management
                              </li>
                              <li>
                                <i className="fa fa-check-circle-o" />Guest
                                Access
                              </li>
                              <li>
                                <i className="fa fa-check-circle-o" />Custom
                                User Groups
                              </li>
                              <li>
                                <i className="fa fa-check-circle-o" />Custom
                                Data Retention
                              </li>
                              <li>
                                <i className="fa fa-check-circle-o" />Custom
                                Profiles
                              </li>
                              <li>
                                <i className="fa fa-check-circle-o" />Priority
                                Support
                              </li>
                            </ul>
                          </div>
                        </Col>

                        <Col xs={4}>
                          <div className="plan text-center">
                            <h3>Power</h3>
                            <div className="price">
                              <sup>$</sup>
                              {this.state.pricingToggle ? "18" : "15"}
                            </div>
                            <div className="price-details">
                              per user per month <br /> billed{" "}
                              <span onClick={this.handleClick}>
                                {this.state.pricingToggle
                                  ? "monthly"
                                  : "annually"}
                              </span>
                            </div>

                            <ul className="list-unstyled text-left plan-features">
                              <li>
                                <i className="fa fa-check-circle-o" />
                                <em>
                                  All features from <strong>Premium</strong>
                                </em>
                              </li>
                              <li>
                                <i className="fa fa-check-circle-o" />Voice &
                                Video Calls
                              </li>
                              <li>
                                <i className="fa fa-check-circle-o" />Priority
                                Messaging
                              </li>
                              <li>
                                <i className="fa fa-check-circle-o" />EHR
                                Integrations
                              </li>
                              <li>
                                <i className="fa fa-check-circle-o" />Advanced
                                Security Controls
                              </li>
                              <li>
                                <i className="fa fa-check-circle-o" />On-Site
                                Training
                              </li>
                              <li>
                                <i className="fa fa-check-circle-o" />Dedicated
                                Support
                              </li>
                            </ul>
                          </div>
                        </Col>
                      </Row>
                    </Tab.Pane>

                    <Tab.Pane eventKey="second">Tab 2 content</Tab.Pane>
                    <Tab.Pane eventKey="third">Tab 3 content</Tab.Pane>
                  </Tab.Content>
                </Col>
              </Row>
            </Tab.Container>
          </div>
        </div>
      </div>
    );
  }
}
