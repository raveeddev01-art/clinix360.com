import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import PatientListItem from "./PatientListItem";
import PatientModal from "./PatientModal";
import PatientsHeader from "./PatientsHeader";

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
        <PatientModal />
      </div>
    );
  }
}

export default PatientsRepo;
