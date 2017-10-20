import React, { Component } from "react";
import { Well, Row, Col, Button } from "react-bootstrap";

export default class TeamExport extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h3 className="text-center">Data Export</h3>
        <p>
          In the event that you need to delete your Stitch account, or require
          electronic discovery for legal purposes, Stitch provides full data
          exports to keep you compliant. Here's what we include in our exports:
        </p>
        <ul className="list-unstyled">
          <li>
            <i className="fa fa-circle" /> Public and private room message
            history
          </li>
          <li>
            <i className="fa fa-circle" /> 1-1 direct message history
          </li>
          <li>
            <i className="fa fa-circle" /> Edited and deleted messages
          </li>
          <li>
            <i className="fa fa-circle" /> Archived room message history
          </li>
          <li>
            <i className="fa fa-circle" /> Links to uploaded files
          </li>
        </ul>

        <p className="m-b-40">
          Message history will be provided in JSON format. You will also receive
          a special token allowing you to access file uploads at their specified
          URLs. See our support article{" "}
          <a href="https://teamstitch.zendesk.com/hc/en-us">here</a> for more on
          how to use these files and tokens.
        </p>

        <Row className="m-b-20">
          <Col md={9}>
            <h4 className="export-heading">Export History</h4>
          </Col>
          <Col md={3}>
            <Button block bsSize="large" bsStyle="primary">
              New Export
            </Button>
          </Col>
        </Row>

        <div className="admin-table m-b-40">
          <div className="table-head">
            <Row>
              <Col sm={6}>Date</Col>
              <Col sm={4}>Uploads Token</Col>
              <Col sm={2} className="text-center">
                Downloads
              </Col>
            </Row>
          </div>

          <div className="table-item">
            <Row>
              <Col sm={6}>Thursday, July 27, 2017 11:34 AM</Col>

              <Col sm={4}>abcdefg123456!@#$%</Col>

              <Col sm={2} className="text-center">
                <a href="#">
                  <i className="fa fa-download" />
                </a>
              </Col>
            </Row>
          </div>
        </div>

        <p className="text-center">
          Questions? Learn more with our <br />{" "}
          <a href="https://teamstitch.zendesk.com/hc/en-us">
            Frequently Asked Questions
          </a>
        </p>
      </div>
    );
  }
}
