import React, { Component } from "react";
import { Link } from "react-router-dom";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";

export default class ResetPassword extends Component {
  render() {
    return (
      <div className="authentication-card text-center">

        <div className="card-header">
          <Row>
            <Col xs={6} className="text-left">
              <OverlayTrigger placement="top" overlay={<Tooltip>Back</Tooltip>}>
                <Link to="/login">
                  <i className="fa fa-arrow-left"></i>
                </Link>
              </OverlayTrigger>
            </Col>

            <Col xs={6} className="text-right">
              <OverlayTrigger placement="top" overlay={<Tooltip>Close</Tooltip>}>
                <Link to="/">
                  <i className="fa fa-close"></i>
                </Link>
              </OverlayTrigger>
            </Col>
          </Row>
        </div>

        <h2>Reset Password</h2>

        <h5>Enter your <strong>email address</strong>.</h5>

        <form>
          <FormGroup bsSize="large">
            <FormControl type="text" placeholder="Email" />
          </FormGroup>

          <Button bsStyle="primary" block>Reset Password</Button>
        </form>

        <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}