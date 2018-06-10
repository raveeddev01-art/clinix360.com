import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import PatientsHeader from "./PatientsHeader";
import PatientListItem from "./PatientListItem";

@inject("patientsStore")
@observer
class PatientsRepo extends Component {
  render() {
    const { patientsStore } = this.props;

    return (
      <div className="patients-repo">
        <PatientsHeader />
        <div className="patients-list">
          {patientsStore.sortedAndFilteredPatients.map((patient, i) => (
            <PatientListItem key={i} patient={patient} />
          ))}
        </div>
      </div>
    );
  }
}

export default PatientsRepo;
