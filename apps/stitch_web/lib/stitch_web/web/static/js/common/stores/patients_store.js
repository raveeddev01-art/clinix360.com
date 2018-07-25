/**
 * Patients store
 *
 * Keeps track of patients for a team
 */

import { action, computed, extendObservable, observable } from "mobx";

// =============
//   CONSTANTS
// =============

const pageLength = 1000;

// ====================
//   HELPER FUNCTIONS
// ====================

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

  return 0;
};

const insertedAtSort = (patientA, patientB) => {
  if (patientA.inserted_at < patientB.inserted_at) return -1;
  if (patientA.inserted_at > patientB.inserted_at) return 1;
  return 0;
};

const matchesFilter = (string, searchFilter) => {
  return string.includes(searchFilter);
};

const searchFilterMatch = (patient, searchFilter) => {
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

const forPage = (list, pageNumber) => {
  const startingIndex = pageLength * pageNumber;
  const endingIndex = startingIndex + pageLength;
  return list.slice(startingIndex, endingIndex);
};

const statusMatch = (patient, statusFilter) => {
  switch (statusFilter) {
    case "all":
      return true;
    case "onboarded":
      return patient.onboarded && !patient.disabled;
    case "pending":
      return !patient.disabled && !patient.onboarded;
    case "deactivated":
      return patient.disabled;
    default:
      return true;
  }
};

// ===============
//   BEGIN STORE
// ===============

class PatientsStore {
  @observable patients = [];
  @observable currentPatient = {};
  @observable page = 0;
  @observable listSort = "first_name";
  @observable sortDirection = "asc";
  @observable statusFilter = "all";
  @observable searchFilter = "";
  @observable modalOpen = false;
  @observable modalPatient = null;
  @observable currentModal = null;

  constructor(rootStore) {
    this.rootStore = rootStore;

    if (this.rootStore.isPatient) {
      // @TODO load conversation patients as patient
      // @FIXME window.patient should have consistent format of first_name, last_name as the other patients
      this.patients = [
        {
          ...window.currentPatient,
          first_name: window.currentPatient.firstName,
          last_name: window.currentPatient.lastName,
          full_name: `${window.currentPatient.firstName} ${window.currentPatient
            .firstName}`
        }
      ];
    } else if (this.rootStore.teamStore.engageEnabled) {
      this.loadPatients();
    }
  }

  // ====================
  //   STATEFUL HELPERS
  // ====================

  getPatient = id => {
    return this.patients.find(p => p.id === id);
  };

  getModalPatient = () => {
    return this.getPatient(this.modalPatientId);
  };

  // ===========
  //   ACTIONS
  // ===========

  // api calls

  @action
  loadPatients = () => {
    return get(`/api/v1/patients`).then(response => {
      this.patients = response.data;
    });
  };

  @action
  openPatient = id => {
    this.loadPatient(id);
  };

  @action
  loadPatient = id => {
    return get(`/api/v1/patients/${id}`).then(response => {
      this.currentPatient = response.data;
    });
  };

  @action
  createPatient = params => {
    return post(`/api/v1/patients/`, { body: params });
  };

  @action
  updatePatient = (id, params) => {
    return put(`/api/v1/patients/${id}`, { body: params });
  };

  @action
  activatePatient = (id, params) => {
    return put(`/api/v1/patients/${id}/activate`, {});
  };

  @action
  deactivatePatient = (id, params) => {
    return put(`/api/v1/patients/${id}/deactivate`, {});
  };

  // channel and api res handlers

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

  // filtering and sorting

  @action
  setPage = newPage => {
    this.page = newPage;
  };

  @action
  incPage = () => {
    this.page = this.page + 1;
  };

  @action
  decPage = () => {
    this.page = this.page - 1;
  };

  @action
  setOption = (optionName, val) => {
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

  // Modal-related

  @action
  setModal = modalName => {
    this.currentModal = modalName;
  };

  @action
  closeModal = () => {
    this.currentModal = null;
  };

  // @action
  // openModal = patientId => {
  //   this.modalOpen = true;
  //   this.modalPatientId = patientId;
  // };

  // ======================
  //   COMPUTED PROPERTIES
  // ======================

  @computed
  get sortedAndFilteredPatients() {
    return this.patients.filter(this.patientsFiler).sort(this.patientsSorter);
  }

  @computed
  get patientsForPage() {
    return forPage(this.sortedAndFilteredPatients, this.page);
  }

  @computed
  get pageCount() {
    return Math.floor(this.sortedAndFilteredPatients.length / pageLength) + 1;
  }

  @computed
  get lowestVisibleIndex() {
    return this.page * pageLength + 1;
  }

  @computed
  get highestVisibleIndex() {
    const endOfPage = (this.page + 1) * pageLength;
    return Math.min(endOfPage, this.totalVisiblePatients);
  }

  @computed
  get totalVisiblePatients() {
    return this.sortedAndFilteredPatients.length;
  }

  @computed
  get patientsFiler() {
    // function of statusFilter && searchFilter
    return p =>
      statusMatch(p, this.statusFilter) &&
      searchFilterMatch(p, this.searchFilter);
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
