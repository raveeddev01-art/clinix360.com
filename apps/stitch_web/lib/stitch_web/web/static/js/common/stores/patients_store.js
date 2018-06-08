/**
 * Patients store
 *
 * Keeps track of patients for a team
 */

import { observable, action } from "mobx";

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
}

export default PatientsStore;
