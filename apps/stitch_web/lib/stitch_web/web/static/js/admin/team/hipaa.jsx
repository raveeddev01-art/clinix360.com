import React, { Component } from "react";
import Well from "react-bootstrap/lib/Well";
import SettingPanel from "../components/setting-panel/setting-panel";

const title = "HIPAA";
const description = "Manage your HIPAA compliance and BAA to safely share PHI.";

export default class TeamHipaa extends Component {
  render() {
    return (
      null
      // <SettingPanel saveButtonText="" title={title} description={description}>
      //   <Well>
      //     <i className="fa fa-check-circle" />
      //     <p className="m-b-0">
      //       Your workspace is <strong>compliant</strong>. You can safely
      //       share patient information in InvoChat.
      //     </p>
      //   </Well>

      //   <p>Your active compliance entails:</p>

      //   <ul className="list-unstyled">
      //     <li>
      //       <i className="fa fa-check-circle-o" /> Business Associate Agreement
      //       (BAA)
      //     </li>
      //     <li>
      //       <i className="fa fa-check-circle-o" /> eDiscovery & Compliance
      //       Exports
      //     </li>
      //     <li>
      //       <i className="fa fa-check-circle-o" /> Rest & Transit Data
      //       Encryption
      //     </li>
      //     <li>
      //       <i className="fa fa-check-circle-o" /> Full HIPAA Rules Compliance
      //     </li>
      //   </ul>
      //   <p>
      //     For an explanation of our BAA, see{" "}
      //     <a
      //       href="info@invozone.com"
      //       target="_blank"
      //       rel="noopener noreferrer"
      //     >
      //       here
      //     </a>. For details on our HIPAA compliance, see{" "}
      //     <a
      //       href="/"
      //       target="_blank"
      //       rel="noopener noreferrer"
      //     >
      //       here
      //     </a>.
      //   </p>
      // </SettingPanel>
    );
  }
}
