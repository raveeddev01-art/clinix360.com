import React, { Component } from "react";
import { Link } from "react-router-dom";

import Tab from "react-bootstrap/lib/Tab";
import Nav from "react-bootstrap/lib/Nav";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import NavItem from "react-bootstrap/lib/NavItem";
import Button from "react-bootstrap/lib/Button";

export default class Downloads extends Component {
  render() {
    return (
      <div>
        <div className="subheader">
          <div className="container">
            <div className="landing-message text-center">
              <h1>Downloads</h1>
              <h3>Download apps for every desktop and mobile platform.</h3>
            </div>
          </div>
        </div>

        <div className="downloads">
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
                        <Col sm={3}>
                          <div className="plan text-center">
                            <a href="http://connect-desktop.teamstitch.com/download/latest/osx_64">
                              <img
                                src="/images/mac-icon.png"
                                alt="Connect for Mac"
                              />
                            </a>

                            <h3>Mac</h3>
                            <div className="m-b-10">macOS 10.8+</div>

                            <Button
                              bsStyle="primary"
                              bsSize="large"
                              href="http://connect-desktop.teamstitch.com/download/latest/osx_64"
                            >
                              Download
                            </Button>
                          </div>
                        </Col>

                        <Col sm={3}>
                          <div className="plan text-center">
                            <a href="http://connect-desktop.teamstitch.com/download/latest/windows_32">
                              <img
                                src="/images/windows-icon.png"
                                alt="Connect for Windows"
                              />
                            </a>

                            <h3>Windows</h3>
                            <div className="m-b-10">macOS 10.8+</div>

                            <Button
                              bsStyle="primary"
                              bsSize="large"
                              href="http://connect-desktop.teamstitch.com/download/latest/windows_32conn"
                            >
                              Download
                            </Button>
                          </div>
                        </Col>

                        <Col sm={3}>
                          <div className="plan text-center">
                            <a disabled>
                              <img
                                src="/images/connect-app-icon.png"
                                alt="Connect for iOS"
                              />
                            </a>

                            <h3>iOS</h3>
                            <div className="m-b-10">iOS 9.0+</div>

                            <Button bsStyle="primary" bsSize="large" disabled>
                              Coming Soon
                            </Button>
                          </div>
                        </Col>

                        <Col sm={3}>
                          <div className="plan text-center">
                            <a disabled>
                              <img
                                src="/images/connect-app-icon.png"
                                alt="Connect for Android"
                              />
                            </a>

                            <h3>Android</h3>
                            <div className="m-b-10">Android 4.0+</div>

                            <Button bsStyle="primary" bsSize="large" disabled>
                              Coming Soon
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </Tab.Pane>

                    <Tab.Pane eventKey="second">
                      <Row>
                        <Col sm={3}>
                          <div className="plan text-center">
                            <a href="https://teamstitch.typeform.com/to/Ncn8x8">
                              <img
                                src="/images/mac-icon.png"
                                alt="Connect for Mac"
                              />
                            </a>

                            <h3>Mac</h3>
                            <div className="m-b-10">macOS 10.8+</div>

                            <Button
                              bsStyle="primary"
                              bsSize="large"
                              href="https://teamstitch.typeform.com/to/Ncn8x8"
                            >
                              Join Beta
                            </Button>
                          </div>
                        </Col>

                        <Col sm={3}>
                          <div className="plan text-center">
                            <a href="https://teamstitch.typeform.com/to/Ncn8x8">
                              <img
                                src="/images/windows-icon.png"
                                alt="Connect for Windows"
                              />
                            </a>

                            <h3>Windows</h3>
                            <div className="m-b-10">macOS 10.8+</div>

                            <Button
                              bsStyle="primary"
                              bsSize="large"
                              href="https://teamstitch.typeform.com/to/Ncn8x8"
                            >
                              Join Beta
                            </Button>
                          </div>
                        </Col>

                        <Col sm={3}>
                          <div className="plan text-center">
                            <a disabled>
                              <img
                                src="/images/engage-app-icon.png"
                                alt="Engage for iOS"
                              />
                            </a>

                            <h3>iOS</h3>
                            <div className="m-b-10">iOS 9.0+</div>

                            <Button bsStyle="primary" bsSize="large" disabled>
                              Coming Soon
                            </Button>
                          </div>
                        </Col>

                        <Col sm={3}>
                          <div className="plan text-center">
                            <a disabled>
                              <img
                                src="/images/engage-app-icon.png"
                                alt="Engage for Android"
                              />
                            </a>

                            <h3>Android</h3>
                            <div className="m-b-10">Android 4.0+</div>

                            <Button bsStyle="primary" bsSize="large" disabled>
                              Coming Soon
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </Tab.Pane>

                    <Tab.Pane eventKey="third">
                      <Row>
                        <Col sm={3}>
                          <div className="plan text-center">
                            <a href="https://teamstitch.typeform.com/to/Ncn8x8">
                              <img
                                src="/images/mac-icon.png"
                                alt="Connect for Mac"
                              />
                            </a>

                            <h3>Mac</h3>
                            <div className="m-b-10">macOS 10.8+</div>

                            <Button
                              bsStyle="primary"
                              bsSize="large"
                              href="https://teamstitch.typeform.com/to/Ncn8x8"
                            >
                              Join Beta
                            </Button>
                          </div>
                        </Col>

                        <Col sm={3}>
                          <div className="plan text-center">
                            <a href="https://teamstitch.typeform.com/to/Ncn8x8">
                              <img
                                src="/images/windows-icon.png"
                                alt="Connect for Windows"
                              />
                            </a>

                            <h3>Windows</h3>
                            <div className="m-b-10">macOS 10.8+</div>

                            <Button
                              bsStyle="primary"
                              bsSize="large"
                              href="https://teamstitch.typeform.com/to/Ncn8x8"
                            >
                              Join Beta
                            </Button>
                          </div>
                        </Col>

                        <Col sm={3}>
                          <div className="plan text-center">
                            <a disabled>
                              <img
                                src="/images/manage-app-icon.png"
                                alt="Manage for iOS"
                              />
                            </a>

                            <h3>iOS</h3>
                            <div className="m-b-10">iOS 9.0+</div>

                            <Button bsStyle="primary" bsSize="large" disabled>
                              Coming Soon
                            </Button>
                          </div>
                        </Col>

                        <Col sm={3}>
                          <div className="plan text-center">
                            <a disabled>
                              <img
                                src="/images/manage-app-icon.png"
                                alt="Engage for Android"
                              />
                            </a>

                            <h3>Manage</h3>
                            <div className="m-b-10">Android 4.0+</div>

                            <Button bsStyle="primary" bsSize="large" disabled>
                              Coming Soon
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </Tab.Pane>
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
