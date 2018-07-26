/**
 * Patients store
 *
 * Keeps track of patients for a team
 */

import { action, computed, extendObservable, observable } from "mobx";
import { stringify } from "qs";
import unionBy from "lodash/unionBy";

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
  @observable paginationMeta = {};
  @observable skipModifier = 0;
  @observable isLoadingPage = false;

  constructor(rootStore) {
    this.rootStore = rootStore;

    if (this.rootStore.teamStore.engageEnabled) {
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
    this.isLoadingPage = true;

    return get(`/api/v1/patients`)
      .then(response => {
        this.isLoadingPage = false;
        this.paginationMeta = response.data.meta;
        this.patients = response.data.patients;
        this.addPatients(response.data.patients);
      })
      .catch(() => {
        this.isLoadingPage = false;
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
  activatePatient = id => {
    return put(`/api/v1/patients/${id}/activate`, {});
  };

  @action
  deactivatePatient = id => {
    return put(`/api/v1/patients/${id}/deactivate`, {});
  };

  @action
  save = (id, data) => {
    return put(`/api/v1/patients/${id}`, {
      body: data,
      hideNotify: true
    });
  };

  @action
  saveAttribute = attrName => (id, attrValue) => {
    return this.save(id, {
      [attrName]: attrValue
    }).then(() => {
      this.currentPatient[attrName] = attrValue;
    });
    
  loadNextPatientPage = () => {
    const url = "/api/v1/patients";

    if (this.allPatientsLoaded) {
      return;
    }

    const params = stringify({ skip: this.paginationSkip });
    this.isLoadingPage = true;

    get(`${url}?${params}`)
      .then(response => {
        this.isLoadingPage = false;
        this.paginationMeta = response.data.meta;
        this.addPatients(response.data.patients);
      })
      .catch(() => {
        this.isLoadingPage = false;
      });
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
    this.incrementSkipModifier();
    this.addPatients([patient]);
  };

  // filtering and sorting

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

  @action
  addPatients = newPatients => {
    this.patients = unionBy(newPatients, this.patients, p => p.id);
  };

  @action
  incrementSkipModifier = () => {
    this.skipModifier = this.skipModifier + 1;
  };

  // ======================
  //   COMPUTED PROPERTIES
  // ======================

  @computed
  get allPatientsLoaded() {
    return this.patients.length >= this.paginationMeta.count;
  }

  @computed
  get paginationSkip() {
    // If a patient is added outside the normal pagination flow,
    // we do not want to factor them into the skip count for the
    // next pagination call. We increment skipModifier whenever
    // a patient is added outside the standard flow.
    return this.patients.length - this.skipModifier;
  }

  @computed
  get sortedAndFilteredPatients() {
    return this.patients.filter(this.patientsFilter).sort(this.patientsSorter);
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
  get patientsFilter() {
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
