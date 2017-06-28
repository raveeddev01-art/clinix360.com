import React, { Component } from "react";
import { Link } from "react-router-dom";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

export default class Email extends Component {
  handleSubmit = event => {
    event.preventDefault();
    console.log("Submitted");
    // to="/signup/confirmation-code"
  };

  render() {
    return (
      <div className="authentication-card text-center">

        <div className="card-header">
          <Row>
            <Col xs={12} className="text-right">
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="close">Close</Tooltip>}
              >
                <Link to="/">
                  <i className="fa fa-close" />
                </Link>
              </OverlayTrigger>
            </Col>
          </Row>
        </div>

        <h2>Email</h2>

        <h5>Enter your <strong>work email address</strong>.</h5>

        <form onSubmit={this.handleSubmit}>
          <FormGroup bsSize="large">
            <FormControl
              name="email"
              required
              type="email"
              placeholder="Email"
            />
          </FormGroup>

          <HelpBlock>
            We will send you a confirmation code to verify your email. If your
            team already has an account, ask your admin for an invitation.
          </HelpBlock>

          <input
            value="Next"
            type="submit"
            className="btn btn-block btn-primary"
          />
        </form>

        <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}
