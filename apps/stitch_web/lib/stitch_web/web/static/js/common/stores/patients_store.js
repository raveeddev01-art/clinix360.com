/**
 * Patients store
 *
 * Keeps track of patients for a team
 */

import { observable, action, extendObservable } from "mobx";

class PatientsStore {
  @observable patients = [];
  constructor(rootStore) {
    this.rootStore = rootStore;
    if (this.rootStore.teamStore.engageEnabled) {
      this.loadPatients();
    }
  }

  @action
  loadPatients = () => {
    return get(`/api/v1/patients`).then(response => {
      this.patients = response.data;
    });
  };

  @action
  onPatientUpdated = updatedPatient => {
    const patient = this.patients.find(p => {
      return p.id === updatedPatient.id;
    });

    console.log("updatedPatient", updatedPatient);
    extendObservable(patient, updatedPatient);
  };

  @action
  onPatientAdded = patient => {
    this.patients.push(patient);
  };
}

export default PatientsStore;
