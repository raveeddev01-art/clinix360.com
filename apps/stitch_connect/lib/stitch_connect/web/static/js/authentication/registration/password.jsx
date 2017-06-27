import React, { Component } from "react";
import { Link } from "react-router-dom";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

export default class Password extends Component {
  render() {
    return (
      <div className="authentication-card text-center">

        <div className="card-header">
          <Row>
            <Col xs={6} className="text-left">
              <OverlayTrigger placement="top" overlay={<Tooltip>Back</Tooltip>}>
                <Link to="/signup/username">
                  <i className="fa fa-arrow-left"></i>
                </Link>
              </OverlayTrigger>
            </Col>

            <Col xs={6} className="text-right">
              <OverlayTrigger placement="top" overlay={<Tooltip>Restart</Tooltip>}>
                <Link to="/signup/team-name">
                  <i className="fa fa-refresh"></i>
                </Link>
              </OverlayTrigger>
            </Col>
          </Row>
        </div>
        
        <h2>Password</h2>

        <h5>Enter a <strong>password</strong>.</h5>

        <form>
          <FormGroup bsSize="large">
            <FormControl type="password" placeholder="Password" />
          </FormGroup>
          
          <HelpBlock>
            Your password must contain:
            <ul className="list-unstyled">
              <li>At least 8 characters</li>
              <li>An uppercase letter</li>
              <li>A lowercase letter</li>
              <li>A number</li>
              <li>A special character (e.g. !$#)</li>
            </ul>
          </HelpBlock>

          <Link to="/signup/pin" className="btn btn-block btn-primary">Next</Link>
        </form>

        <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}