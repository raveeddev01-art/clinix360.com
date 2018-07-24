import React, { Component } from "react";

class PatientInfo extends Component {
  render() {
    return (
      <div>
        <h1> Patient Info: </h1>
        <ul>
          <li>
            Name: {currentPatient.first_name} {currentPatient.last_name}
          </li>
          <li>Email: {currentPatient.email}</li>
          <li>Token: {window.authenticationToken}</li>
        </ul>
      </div>
    );
  }
}

export default PatientInfo;
