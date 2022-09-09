import React, { Component } from "react";
import { Link } from "react-router-dom";

import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";

export default class Footer extends Component {
  render() {
    return (
      <footer id="footer" style={{ paddingBottom: "0" }}>
        <div className="container">
          <Row>
            <Col sm={2} md={3}>
              <img
                className="stitch-logo"
                src="favicon.ico"
                alt="InvoChat"
              />
            </Col>

            <Col sm={10} md={9}>
              <Row>
                {/* <Col xs={6} sm={3} md={3}>
                  <h5>Resources</h5>
                  <ul className="list-unstyled">
                    <li>
                      <Link to="/customers">Customers</Link>
                    </li>
                    <li>
                      <a
                      disabled
                        target="_blank"
                        rel="noopener noreferrer"
                        href="/"
                      >
                        Help Center
                      </a>
                    </li>
                    <li>
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://medium.com/stitch-health"
                      >
                        Blog
                      </a>
                    </li>
                  </ul>
                </Col> */}

                <Col xs={6} sm={3} md={3}>
                  <h5>Platform</h5>
                  <ul className="list-unstyled">
                    <li>
                      <Link to="/connect">Product</Link>
                    </li>
                    {/* <li>
                      <Link to="/downloads">Downloads</Link>
                    </li> */}
                    <li>
                      <Link to="/pricing">Pricing</Link>
                    </li>
                  </ul>
                </Col>

                <Col xs={6} sm={3} xsPush={6} smPush={0}>
                  <h5>Legal</h5>
                  <ul className="list-unstyled">
                    <li>
                      <Link to="/privacy-policy">Privacy Policy</Link>
                    </li>
                    <li>
                      <Link to="/terms-of-service">Terms of Service</Link>
                    </li>
                  </ul>
                </Col>

                <Col xs={6} sm={3} xsPull={6} smPull={0}>
                  <h5>Contact</h5>
                  <address>
                    InvoChat
                    <br />
                    156 2nd Street<br />
                    San Francisco, CA<br />
                  </address>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
        <Row style={{ position: "relative" }}>
          <img
            style={{ width: "100%" }}
            src="/images/InvoChat.png"
            alt="InvoChat"
          />
          <a href="https://invozone.com/" target="_blank" style={{ display:"block", width:"10%", height:"70%", position:"absolute", right: "10%", top: "13%", opacity:"0" }}></a>
        </Row>
      </footer>
    );
  }
}