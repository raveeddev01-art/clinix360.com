import React, { Component } from "react";
import { Link } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import cx from "classnames";

import CreateTeamForm from "./components/create-team";
import CUSTOMERS from "./components/customers-logos";

import Button from "react-bootstrap/lib/Button";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";

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
        {/* <Navbar id="header" inverse>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/" className="brand">
                <img src="/images/stitch-brand.png" alt="Stitch" />
              </Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav pullRight>
              <NavItem eventKey={1} href="/signin">
                Sign In
              </NavItem>

              <NavItem
                eventKey={2}
                href="/signup/email"
                className="btn-outline"
              >
                Create Team
              </NavItem>
            </Nav>
          </Navbar.Collapse>
        </Navbar> */}

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

                  <CreateTeamForm />
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
          <a id="intercom-link" href="jig8cj9z@inbound.intercom-mail.com">
            Intercom
          </a>
        </div>

        {/* <div className="subheader">
          <div className="container">
            <div className="landing-message text-center">
              <h1>Care Coordination</h1>
              <h3>
                Communicate, write notes, track tasks, <br />upload files, and
                collaborate on any device.
              </h3>

              <CreateTeamForm />

              <div className="trial">
                Get started with an unlimited{" "}
                <br className="visible-xs-inline" />number of people on our free
                14-day trial.
              </div>
            </div>
          </div>
        </div>

        <div className="our-customers text-center">
          <div className="container">
            <div className="customer-logos">
              <div className="row logo-row">{this.renderCustomers()}</div>
            </div>
          </div>
        </div>

        <section className="stitch-products">
          <div className="product-section">
            <div className="container">
              <div className="flex-box">
                <div className="flex-item">
                  <div className="product-info">
                    <h2>Connect</h2>
                    <h3>Team Messaging</h3>

                    <p className="m-b-20">
                      Stitch Connect provides a powerful team communication
                      experience across all devices. We complement a modern user
                      experience with advanced security architecture to deliver
                      the latest in communication technology to the healthcare
                      world.
                    </p>

                    <LinkContainer to="/pricing">
                      <Button bsStyle="primary" bsSize="large">
                        Learn More
                      </Button>
                    </LinkContainer>
                  </div>
                </div>

                <div className="flex-item">
                  <div className="product-image">
                    <img
                      src="/images/connect-feature-1.png"
                      alt="Stitch Connect"
                      className="img-responsive"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="product-section">
            <div className="container">
              <div className="flex-box">
                <div className="flex-item">
                  <div className="product-image">
                    <img
                      src="/images/engage-feature-1.png"
                      alt="Stitch Engage"
                      className="img-responsive"
                    />
                  </div>
                </div>

                <div className="flex-item">
                  <div className="product-info">
                    <h2>Engage</h2>
                    <h3>Patient Messaging</h3>

                    <p className="m-b-20">
                      Stitch Engage offers a complete patient engagement
                      solution. Send messages, share files and start video calls
                      directly with patients. Relax knowing your patients can
                      easily access important communications with our
                      intuitively designed app on any device.
                    </p>

                    <Button
                      bsStyle="primary"
                      bsSize="large"
                      href="https://teamstitch.typeform.com/to/Ncn8x8"
                    >
                      Join Beta
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="product-section">
            <div className="container">
              <div className="flex-box">
                <div className="flex-item">
                  <div className="product-info">
                    <h2>Manage</h2>
                    <h3>Patient Management</h3>

                    <p className="m-b-20">
                      Stitch Manage is the easiest way to collaborate on
                      patients. Post clinical notes, status updates and key data
                      points to keep everyone on the same page. Use Manage to
                      track patient tasks and keep your workflow organized,
                      wherever you are.
                    </p>

                    <Button
                      bsStyle="primary"
                      bsSize="large"
                      href="https://teamstitch.typeform.com/to/Ncn8x8"
                    >
                      Join Beta
                    </Button>
                  </div>
                </div>

                <div className="flex-item">
                  <div className="product-image">
                    <img
                      src="/images/manage-feature-1.png"
                      alt="Stitch Manage"
                      className="img-responsive"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section> */}
      </div>
    );
  }
}
