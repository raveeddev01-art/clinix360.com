/**
 * Patients store
 *
 * Keeps track of patients for a team
 */

import { observable, action, computed, extendObservable } from "mobx";

const stringSort = stringAttrName => (patientA, patientB) => {
  if (
    patientA[stringAttrName].toLowerCase() <
    patientB[stringAttrName].toLowerCase()
  )
    return -1;
  if (
    patientA[stringAttrName].toLowerCase() >
    patientB[stringAttrName].toLowerCase()
  )
    return 1;
};

const insertedAtSort = (patientA, patientB) => {
  if (patientA.inserted_at < patientB.inserted_at) return -1;
  if (patientA.inserted_at > patientB.inserted_at) return 1;
  return 0;
};

const matchesFilter = (string, searchFilter) => {
  return string.includes(searchFilter);
};

const patientMatch = (patient, searchFilter) => {
  const filterString = searchFilter.toLowerCase();
  if (!filterString) {
    return true;
  }

  return (
    matchesFilter(patient.first_name.toLowerCase(), filterString) ||
    matchesFilter(patient.last_name.toLowerCase(), filterString) ||
    matchesFilter(patient.email.toLowerCase(), filterString) ||
    matchesFilter(patient.mrn.toLowerCase(), filterString)
  );
};

class PatientsStore {
  @observable patients = [];
  @observable listSort = "first_name";
  @observable sortDirection = "asc";
  @observable statusFilter = "any";
  @observable searchFilter = "";

  constructor(rootStore) {
    this.rootStore = rootStore;
    if (this.rootStore.teamStore.engageEnabled) {
      this.loadPatients();
    }
  }

  // ===========
  //   ACTIONS
  // ===========

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

    extendObservable(patient, updatedPatient);
  };

  @action
  onPatientAdded = patient => {
    this.patients.push(patient);
  };

  @action
  setOption = optionName => ({ id: val }) => {
    this[optionName] = val;
  };

  @action
  getOption = optionName => {
    return this[optionName];
  };

  @action
  setSearchFilter = filterString => {
    this.searchFilter = filterString.trim();
  };

  // ======================
  //   COMPUTED PROPERTIES
  // ======================

  @computed
  get sortedAndFilteredPatients() {
    return this.patients.filter(this.patientsFiler).sort(this.patientsSorter);
  }

  @computed
  get patientsFiler() {
    // function of statusFilter && searchFilter
    return p => patientMatch(p, this.searchFilter);
  }

  @computed
  get patientsSorter() {
    return (patientA, patientB) => {
      let sortVal;

      switch (this.listSort) {
        case "first_name":
          sortVal =
            stringSort("first_name")(patientA, patientB) ||
            stringSort("last_name")(patientA, patientB) ||
            insertedAtSort(patientA, patientB);
          break;
        case "last_name":
          sortVal =
            stringSort("last_name")(patientA, patientB) ||
            stringSort("first_name")(patientA, patientB) ||
            insertedAtSort(patientA, patientB);
          break;
        case "mrn":
          sortVal =
            stringSort("mrn")(patientA, patientB) ||
            insertedAtSort(patientA, patientB);
          break;
        default:
          sortVal = insertedAtSort(patientA, patientB);
      }

      return this.sortDirection === "asc" ? sortVal : sortVal * -1;
    };
  }
}

export default PatientsStore;
