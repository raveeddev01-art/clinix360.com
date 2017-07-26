import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Panel, Well } from "react-bootstrap";

export default class TeamHipaa extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Panel className="admin-panel">
        <h1 className="text-center">HIPAA</h1>

        <Well>
          <i className="fa fa-check-circle" />
          Your team is <strong>HIPAA compliant</strong>. You can safely share
          patient information in Stitch.
        </Well>

        <p>Your active HIPAA compliance entails:</p>

        <ul className="list-unstyled">
          <li>
            <i className="fa fa-check-circle-o" /> Business Associate Agreement
            (BAA)
          </li>
          <li>
            <i className="fa fa-check-circle-o" /> eDiscovery & Compliance
            Exports
          </li>
          <li>
            <i className="fa fa-check-circle-o" /> Rest & Transit Data
            Encryption
          </li>
          <li>
            <i className="fa fa-check-circle-o" /> Full HIPAA Rules Compliance
          </li>
        </ul>

        <p>
          For an explanation of our BAA, see{" "}
          <a href="https://teamstitch.zendesk.com/hc/en-us/articles/226677427-Business-Associates-Agreement-BAA-">
            here
          </a>. For details on our HIPAA compliance, see{" "}
          <a href="https://teamstitch.zendesk.com/hc/en-us/articles/226676267-HIPAA-compliance">
            here
          </a>.
        </p>
      </Panel>
    );
  }
}
