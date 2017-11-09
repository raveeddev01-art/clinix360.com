import React, { Component } from "react";
import { Well } from "react-bootstrap";

export default class TeamHipaa extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h3 className="text-center">HIPAA</h3>
        <Well>
          <i className="fa fa-check-circle" />
          <p className="m-b-0">
            Your team is <strong>HIPAA compliant</strong>. You can safely share
            patient information in Stitch.
          </p>
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
          <a href="https://intercom.help/teamstitch/connect/security/business-associate-agreement-baa">
            here
          </a>. For details on our HIPAA compliance, see{" "}
          <a href="https://intercom.help/teamstitch/connect/security/hipaa-compliance">
            here
          </a>.
        </p>
      </div>
    );
  }
}
