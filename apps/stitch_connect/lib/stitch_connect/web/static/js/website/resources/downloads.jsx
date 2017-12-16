import React, { Component } from "react";
import { Link } from "react-router-dom";

import Header from "../components/header";
import Footer from "../components/footer";

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
        <Header />
        <div className="subheader">
          <div className="container">
            <div className="landing-message text-center">
              <h1>Downloads</h1>
              <h3>Download apps for every desktop and mobile platform.</h3>
            </div>
          </div>
        </div>

        <div className="downloads-page">
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
                      <p className="m-b-10 hidden-xs hidden-sm">
                        Team Messaging
                      </p>
                    </NavItem>

                    <NavItem eventKey="second">
                      <img
                        src="/images/engage-icon.png"
                        alt="Stitch Connect"
                        className="m-b-10"
                      />
                      <h3>Engage</h3>
                      <p className="m-b-10 hidden-xs hidden-sm">
                        Patient Messaging
                      </p>
                    </NavItem>

                    <NavItem eventKey="third">
                      <img
                        src="/images/manage-icon.png"
                        alt="Stitch Connect"
                        className="m-b-10"
                      />
                      <h3>Manage</h3>
                      <p className="m-b-10 hidden-xs hidden-sm">
                        Patient Management
                      </p>
                    </NavItem>
                  </Nav>
                </Col>

                <Col xs={12}>
                  <Tab.Content animation={false}>
                    <Tab.Pane eventKey="first">
                      <Row>
                        <Col sm={3}>
                          <div className="plan text-center">
                            <a href="/download-mac">
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
                              href="/download-mac"
                            >
                              Download
                            </Button>
                          </div>
                        </Col>

                        <Col sm={3}>
                          <div className="plan text-center">
                            <a href="/download-win">
                              <img
                                src="/images/windows-icon.png"
                                alt="Connect for Windows"
                              />
                            </a>

                            <h3>Windows</h3>
                            <div className="m-b-10">Windows 7+</div>

                            <Button
                              bsStyle="primary"
                              bsSize="large"
                              href="/download-win"
                            >
                              Download
                            </Button>
                          </div>
                        </Col>

                        <Col sm={3}>
                          <div className="plan text-center">
                            <a
                              target="_blank"
                              href="https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=1299521330&mt=8"
                            >
                              <img
                                src="/images/connect-app-icon.png"
                                alt="Connect for iOS"
                              />
                            </a>

                            <h3>iOS</h3>
                            <div className="m-b-10">iOS 9.0+</div>

                            <a
                              className="appstore-link"
                              target="_blank"
                              href="https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=1299521330&mt=8"
                            >
                              <img
                                src="/images/appstore.png"
                                alt="Connect for iOS"
                              />
                            </a>
                          </div>
                        </Col>

                        <Col sm={3}>
                          <div className="plan text-center">
                            <a
                              target="_blank"
                              href="https://play.google.com/store/apps/details?id=com.teamstitch.stitch_connect&hl=en"
                            >
                              <img
                                src="/images/connect-app-icon.png"
                                alt="Connect for Android"
                              />
                            </a>

                            <h3>Android</h3>
                            <div className="m-b-10">Android 4.0+</div>

                            <a
                              className="playstore-link"
                              href="https://play.google.com/store/apps/details?id=com.teamstitch.stitch_connect&hl=en"
                              target="_blank"
                            >
                              <img
                                src="/images/playstore.png"
                                alt="Connect for Android"
                              />
                            </a>
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
                              Request Access
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
                            <div className="m-b-10">Windows 7+</div>

                            <Button
                              bsStyle="primary"
                              bsSize="large"
                              href="https://teamstitch.typeform.com/to/Ncn8x8"
                            >
                              Request Access
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

                            <Button
                              bsStyle="primary"
                              bsSize="large"
                              href="https://teamstitch.typeform.com/to/Ncn8x8"
                            >
                              Request Access
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

                            <Button
                              bsStyle="primary"
                              bsSize="large"
                              href="https://teamstitch.typeform.com/to/Ncn8x8"
                            >
                              Request Access
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
                              href="https://teamstitch.typeform.com/to/Yt22AI"
                            >
                              Request Access
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
                            <div className="m-b-10">Windows 7+</div>

                            <Button
                              bsStyle="primary"
                              bsSize="large"
                              href="https://teamstitch.typeform.com/to/Yt22AI"
                            >
                              Request Access
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

                            <Button
                              bsStyle="primary"
                              bsSize="large"
                              href="https://teamstitch.typeform.com/to/Yt22AI"
                            >
                              Request Access
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

                            <Button
                              bsStyle="primary"
                              bsSize="large"
                              href="https://teamstitch.typeform.com/to/Yt22AI"
                            >
                              Request Access
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

        <Footer />
      </div>
    );
  }
}
