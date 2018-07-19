import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import Sidebar from "./sidebar/sidebar";
import PatientModal from "./PatientModal";

@inject("patientsStore")
@observer
class PatientsRepo extends Component {
  render() {
    return (
      <div className="engage-wrapper">
        <Sidebar />

        <div id="main">
          <div className="flex-content">
            <h1>the main panel</h1>
          </div>
        </div>

        <PatientModal />
      </div>
    );
  }
}

export default PatientsRepo;
