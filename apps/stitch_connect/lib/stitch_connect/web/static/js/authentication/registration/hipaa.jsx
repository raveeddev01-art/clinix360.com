import React, { Component } from "react";
import { Link } from "react-router-dom";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Checkbox from "react-bootstrap/lib/Checkbox";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

export default class Hipaa extends Component {
  render() {
    return (
      <div className="authentication-card text-center">

        <div className="card-header">
          <Row>
            <Col xs={6} className="text-left">
              <OverlayTrigger placement="top" overlay={<Tooltip>Back</Tooltip>}>
                <Link to="/signup/invites">
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
        
        <h2>HIPAA</h2>

        <h5><strong>Business Associate Agreement</strong></h5>

        <form>
          <Checkbox>I agree to the terms of the HIPAA BAA</Checkbox>
          
          <HelpBlock>Learn more about BAAs <a href="#">here</a>. By checking the box above, you represent that your team agrees to the terms of the <a href="#">HIPAA BAA</a>.</HelpBlock>

          <Link to="/signup/app-download" className="btn btn-block btn-primary btn-done">Done!</Link>

          <HelpBlock>By proceeding to use Stitch, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</HelpBlock>
        </form>

        <p className="copyright">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}