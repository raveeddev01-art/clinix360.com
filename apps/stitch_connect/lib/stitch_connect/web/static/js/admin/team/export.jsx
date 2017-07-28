import React, { Component } from "react";
import { Panel, Well, Row, Col, Table, Button } from "react-bootstrap";

export default class TeamExport extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Panel className="admin-panel">
        <h1 className="admin-title">Data Export</h1>
        <p>
          In the event that you need to delete your Stitch account, or require
          electronic discovery for legal purposes, Stitch provides full data
          exports to keep you compliant. Here's what we include in our exports:
        </p>
        <ul className="list-unstyled">
          <li>
            <i className="fa fa-circle" /> Public and private group message
            history
          </li>
          <li>
            <i className="fa fa-circle" /> 1-1 direct message history
          </li>
          <li>
            <i className="fa fa-circle" /> Edited and deleted messages
          </li>
          <li>
            <i className="fa fa-circle" /> Archived group message history
          </li>
          <li>
            <i className="fa fa-circle" /> Links to uploaded files
          </li>
        </ul>

        <p className="m-b-40">
          Message history will be provided in JSON format. You will also receive
          a special token allowing you to access file uploads at their specified
          URLs. See our support article <a href="#">here</a> for more on how to
          use these files and tokens.
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

        <Table responsive striped>
          <thead className="m-b-10">
            <tr>
              <th>Date</th>
              <th>Uploads Token</th>
              <th className="text-center">Download</th>
            </tr>
            <tr className="separator" />
          </thead>
          <tbody>
            <tr>
              <td>Thursday, July 27, 2017 11:34 AM</td>
              <td>abcdefg123456!@#$%</td>
              <td className="text-center">
                <a href="#">
                  <i className="fa fa-download" />
                </a>
              </td>
            </tr>
            <tr>
              <td>Thursday, July 27, 2017 11:34 AM</td>
              <td>abcdefg123456!@#$%</td>
              <td className="text-center">
                <a href="#">
                  <i className="fa fa-download" />
                </a>
              </td>
            </tr>
            <tr>
              <td>Thursday, July 27, 2017 11:34 AM</td>
              <td>abcdefg123456!@#$%</td>
              <td className="text-center">
                <a href="#">
                  <i className="fa fa-download" />
                </a>
              </td>
            </tr>
          </tbody>
        </Table>

        <p className="text-center">
          Questions? Learn more with our <br />{" "}
          <a href="#">Frequently Asked Questions</a>
        </p>
      </Panel>
    );
  }
}
