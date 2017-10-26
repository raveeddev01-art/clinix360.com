import React, { Component } from "react";
import { Link } from "react-router-dom";
// import CreateTeamForm from "./create-team";
// import Navigation from "./navigation";

import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";

export default class Header extends Component {
  render() {
    return (
      // <div className="landing-hero">
      //   <div className="container">
      //     <Navigation />

      //     <div className="landing-message text-center">
      //       <h1>Care Coordination</h1>
      //       <h3>
      //         Communicate, write notes, track tasks, <br />upload files, and
      //         collaborate on any device.
      //       </h3>

      //       <CreateTeamForm />

      //       <div className="trial">
      //         Get started with an unlimited <br className="visible-xs-inline" />number
      //         of people on our free 14-day trial.
      //       </div>
      //     </div>
      //   </div>
      // </div>

      <header id="header">
        <div className="container">
          <Row>
            <Col md={4}>Stitch</Col>
            <Col md={8}>
              <ul className="list-inline text-right m-b-0">
                <li>
                  <Link to="/connect">Connect</Link>
                </li>
                <li>
                  <Link to="/pricing">Pricing</Link>
                </li>
                <li>
                  <Link to="/downloads">Downloads</Link>
                </li>
                <li>
                  <a href="https://teamstitch.zendesk.com/hc/en-us">Support</a>
                </li>
                <li>
                  <a href="/signin">Sign In</a>
                </li>
                <li>
                  <a href="/signup/email" className="btn-outline">
                    Create Team
                  </a>
                </li>
              </ul>
            </Col>
          </Row>
        </div>
      </header>
    );
  }
}
