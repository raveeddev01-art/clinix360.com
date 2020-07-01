import React, { Component } from "react";

import Tab from "react-bootstrap/lib/Tab";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Button from "react-bootstrap/lib/Button";

import Header from "../components/header";
import Subheader from "../components/subheader";
import GetStarted from "../components/get-started";
import Footer from "../components/footer";

export default class Downloads extends Component {
  render() {
    return (
      <div className="downloads-page">
        <Header />

        <Subheader
          title="Downloads"
          subtitle="Download the Clinix360 app for every desktop and mobile platform."
        />

        <div className="downloads-content">
          <div className="container">
            <Tab.Container id="left-tabs-example" defaultActiveKey="first">
              <Row className="clearfix">
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

                            <Button bsStyle="primary" href="/download-mac">
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

                            <Button bsStyle="primary" href="/download-win">
                              Download
                            </Button>
                          </div>
                        </Col>

                        <Col sm={3}>
                          <div className="plan text-center">
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              href="https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=1299521330&mt=8"
                            >
                              <img
                                className="mobile-app-img"
                                src="/images/app-icon.png"
                                alt="Connect for iOS"
                              />
                            </a>

                            <h3>iOS</h3>
                            <div className="m-b-10">iOS 9.0+</div>

                            <a
                              className="appstore-link"
                              target="_blank"
                              rel="noopener noreferrer"
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
                              rel="noopener noreferrer"
                              href="https://play.google.com/store/apps/details?id=com.teamstitch.stitch_connect&hl=en"
                            >
                              <img
                                className="mobile-app-img"
                                src="/images/app-icon.png"
                                alt="Connect for Android"
                              />
                            </a>

                            <h3>Android</h3>
                            <div className="m-b-10">Android 4.0+</div>

                            <a
                              className="playstore-link"
                              rel="noopener noreferrer"
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
                  </Tab.Content>
                </Col>
              </Row>
            </Tab.Container>
          </div>
        </div>

        <GetStarted />
        <Footer />
      </div>
    );
  }
}
