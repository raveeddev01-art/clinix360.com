import React, { Component } from "react";
import { Link } from "react-router-dom";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";

export default class Invites extends Component {
  render() {
    return (
      <div className="authentication-card text-center">

        <div className="card-header">
          <Row>
            <Col xs={6} className="text-left">
              <OverlayTrigger placement="top" overlay={<Tooltip>Back</Tooltip>}>
                <Link to="/signup/pin">
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

        <h2>Send Invitations</h2>

        <h5>Enter <strong>invitations</strong> to email out.</h5>

        <form>
          <FormGroup bsSize="large">
            <FormControl type="text" />
          </FormGroup>
          <FormGroup bsSize="large">
            <FormControl type="text" />
          </FormGroup>
          <FormGroup bsSize="large">
            <FormControl type="text" />
          </FormGroup>

          <Button block className="m-b-10">Add Invitations</Button>

          <HelpBlock className="m-b-20">Enter your team members' email addresses so they can join your team. You can also do this later after you set up your team.</HelpBlock>

          <Link to="/signup/hipaa" className="btn btn-block btn-lg btn-primary">Next</Link>
          <Link to="/signup/hipaa" className="btn btn-block btn-lg btn-default m-b-40">Skip this step</Link>
        </form>

        <p className="copyright m-b-0">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}