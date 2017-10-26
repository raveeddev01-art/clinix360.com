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
            <Col md={3}>
              <h5>Products</h5>
              <ul className="list-unstyled">
                <li>
                  <a href="#">Connect</a>
                </li>
              </ul>
            </Col>

            <Col md={3}>
              <h5>Resources</h5>
              <ul className="list-unstyled">
                <li>
                  <a href="#">Pricing</a>
                </li>
                <li>
                  <a href="#">Downloads</a>
                </li>
                <li>
                  <a
                    target="_blank"
                    href="https://teamstitch.zendesk.com/hc/en-us"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </Col>

            <Col md={3}>
              <h5>Company</h5>
              <ul className="list-unstyled">
                <li>
                  <a href="#">Privacy Policy</a>
                </li>
                <li>
                  <a href="#">Terms of Service</a>
                </li>
              </ul>
            </Col>

            <Col md={3}>
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
