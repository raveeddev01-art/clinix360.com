import React, { Component } from "react";

import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";

export default class Footer extends Component {
  render() {
    return (
      <footer id="footer">
        <div className="container">
          <Row>
            <Col xs={6} md={3}>
              <h5>Products</h5>
              <ul className="list-unstyled">
                <li>
                  <a href={`https://${applicationHost}/connect`}>Connect</a>
                </li>
                <li>
                  <a href={`https://${applicationHost}/engage`}>Engage</a>
                </li>
                <li>
                  <a href={`https://${applicationHost}/manage`}>Manage</a>
                </li>
              </ul>
            </Col>

            <Col xs={6} md={3}>
              <h5>Resources</h5>
              <ul className="list-unstyled">
                <li>
                  <a href={`https://${applicationHost}/pricing`}>Pricing</a>
                </li>
                <li>
                  <a href={`https://${applicationHost}/downloads`}>Downloads</a>
                </li>
                <li>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://calendly.com/teamstitch/demo"
                  >
                    Demo
                  </a>
                </li>
                <li>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://intercom.help/teamstitch"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </Col>

            <Col xs={6} md={3}>
              <h5>Company</h5>
              <ul className="list-unstyled">
                <li>
                  <a href={`https://${applicationHost}/customers`}>Customers</a>
                </li>
                <li>
                  <a href={`https://${applicationHost}/privacy-policy`}>
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href={`https://${applicationHost}/terms-of-service`}>
                    Terms of Service
                  </a>
                </li>
              </ul>
            </Col>

            <Col xs={6} md={3}>
              <h5>Contact</h5>
              <address>
                <strong>Stitch Technologies, Inc.</strong>
                <br />
                188 King St. PH9<br />
                San Francisco, CA 94107<br />
                <a href="tel:+16502823388">+1 (650) 282-3388</a>
                <a href="mailto:support@teamstitch.com">
                  support@teamstitch.com
                </a>
              </address>
            </Col>
          </Row>
        </div>
      </footer>
    );
  }
}
