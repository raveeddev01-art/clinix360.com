import React, { Component } from "react";
import { Link } from "react-router-dom";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import InputGroup from "react-bootstrap/lib/InputGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

export default class Confirmation extends Component {
  render() {
    return (
      <div className="authentication-card text-center">

        <div className="card-header">
          <Row>
            <Col xs={12} className="text-right">
              <OverlayTrigger placement="top" overlay={<Tooltip>Close</Tooltip>}>
                <Link to="/">
                  <i className="fa fa-close"></i>
                </Link>
              </OverlayTrigger>
            </Col>
          </Row>
        </div>
        
        <h2>Check your email!</h2>

        <h5>Enter your <strong>confirmation code</strong>.</h5>

        <form>
          <div className="confirmation-code">
            <InputGroup className="code-group">
              <FormControl type="text" maxLength="1" />
              <FormControl type="text" maxLength="1" />
              <FormControl type="text" maxLength="1" />
            </InputGroup>

            <div className="code-separator">—</div>

            <InputGroup className="code-group">
              <FormControl type="text" maxLength="1" />
              <FormControl type="text" maxLength="1" />
              <FormControl type="text" maxLength="1" />
            </InputGroup>
            <div className="clearfix"></div>
          </div>

          <HelpBlock>We sent a six-digit confirmation code to <strong>email@here.com</strong> to verify your email address.</HelpBlock>
          
          <Link to="/signup/team-name" className="btn btn-block btn-primary">Next</Link>
        </form>

        <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}