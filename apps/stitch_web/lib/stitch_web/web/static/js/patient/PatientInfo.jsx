import React, { Component } from "react";

class PatientInfo extends Component {
  render() {
    return (
      <div>
        <h1> Patient Info: </h1>
        <ul>
          <li>
            Name: {currentUser.firstName} {currentUser.lastName}
          </li>
          <li>Email: {currentUser.email}</li>
          <li>Token: {window.authenticationToken}</li>
        </ul>
      </div>
    );
  }
}

export default PatientInfo;
