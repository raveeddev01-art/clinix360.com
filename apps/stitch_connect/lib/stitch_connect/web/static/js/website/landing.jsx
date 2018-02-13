import React, { Component } from "react";
import { Link } from "react-router-dom";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Button from "react-bootstrap/lib/Button";
import cx from "classnames";

import CUSTOMERS from "./components/customers-logos";

export default class Landing extends Component {
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
      <div id="pre-launch-landing">
        <div id="header">
          <div className="container">
            <Row>
              <Col xs={5}>
                <a href="/" className="brand">
                  <img src="/images/stitch-brand.png" alt="Stitch" />
                </a>
              </Col>

              <Col xs={7}>
                <ul className="list-inline text-right m-b-0">
                  <li>
                    <a href="/signin" className="nav-link">
                      Sign In
                    </a>
                  </li>

                  <li>
                    <a href="/signup/email" className="nav-link btn-outline">
                      Create Team
                    </a>
                  </li>
                </ul>
              </Col>
            </Row>
          </div>
        </div>

        <div className="landing-content">
          <div className="container">
            <Row>
              <Col md={5}>
                <div className="landing-message">
                  <h1>Care Coordination</h1>
                  <h3>
                    Communicate, write notes, track tasks, upload files, and
                    collaborate on any device.
                  </h3>

                  <Button
                    bsSize="lg"
                    bsStyle="primary"
                    href="https://teamstitch.com/signup/email"
                  >
                    Start Trial
                  </Button>
                </div>
              </Col>

              <Col md={7}>
                <img
                  src="/images/landing-products.png"
                  alt=""
                  className="img-responsive"
                />
              </Col>
            </Row>
          </div>
        </div>

        <div id="footer">
          <div className="container">
            <Row>
              <Col sm={4}>Stitch Technologies, Inc</Col>
              <Col sm={8}>
                <ul className="list-inline m-b-0 text-right">
                  <li>
                    <Link to="/hipaa">HIPAA</Link>
                  </li>
                  <li>
                    <Link to="/privacy-policy">Privacy Policy</Link>
                  </li>
                  <li>
                    <Link to="/terms-of-service">Terms of Service</Link>
                  </li>
                </ul>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }
}
