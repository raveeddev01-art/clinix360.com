import React, { Component } from "react";
import { Link } from "react-router-dom";

import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";

export default class Footer extends Component {
  render() {
    return (
      <footer id="footer">
        <div className="container">
          <Row>
            <Col sm={2} md={3}>
              <img
                className="stitch-logo"
                src="/images/logo-blue.svg"
                alt="Stitch"
              />
            </Col>

            <Col sm={10} md={9}>
              <Row>
                <Col xs={6} sm={3} md={3}>
                  <h5>Resources</h5>
                  <ul className="list-unstyled">
                    <li>
                      <Link to="/customers">Customers</Link>
                    </li>
                    <li>
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://help.stitch.health"
                      >
                        Help Center
                      </a>
                    </li>
                    <li>
                      <Link to="/hipaa">HIPAA</Link>
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
                </Col>

                <Col xs={6} sm={3} md={3}>
                  <h5>Platform</h5>
                  <ul className="list-unstyled">
                    <li>
                      <Link to="/connect">Product</Link>
                    </li>
                    <li>
                      <Link to="/downloads">Downloads</Link>
                    </li>
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
                    <li>
                      <Link to="/baa">BAA</Link>
                    </li>
                  </ul>
                </Col>

                <Col xs={6} sm={3} xsPull={6} smPull={0}>
                  <h5>Contact</h5>
                  <address>
                    Stitch Health
                    <br />
                    156 2nd Street<br />
                    San Francisco, CA<br />
                  </address>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </footer>
    );
  }
}
