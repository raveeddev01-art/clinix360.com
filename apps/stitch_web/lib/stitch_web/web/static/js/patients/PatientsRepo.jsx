import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import PatientsHeader from "./PatientsHeader";
import PatientListItem from "./PatientListItem";

@inject("patientsStore")
@observer
class PatientsRepo extends Component {
  render() {
    const { patientsStore: { patients } } = this.props;

    return (
      <div className="patients-repo">
        <PatientsHeader />
        <div className="patients-list">
          {patients.map(patient => <PatientListItem patient={patient} />)}
        </div>
      </div>
    );
  }
}

export default PatientsRepo;
