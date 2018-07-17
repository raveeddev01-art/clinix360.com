/**
 * Current Patient Store
 *
 * This store keeps track of data of the current patient
 */

import { observable, action } from "mobx";

class CurrentPatientStore {
  @observable loading = false;
  @observable id = patient.id;
  @observable phone = patient.phone || "";
  @observable email = patient.email;
  @observable firstName = patient.firstName;
  @observable lastName = patient.lastName;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  onPatientInfo = patient => {
    this.firstName = patient.firstName;
    this.lastName = patient.lastName;
    this.phone = patient.phone;
  };

  @action
  save = data => {
    return put(`/api/v1/patient/info`, {
      body: data,
      hideNotify: true
    });
  };

  @action
  saveName = (firstName, lastName) => {
    return this.save({
      first_name: firstName,
      last_name: lastName
    }).then(() => {
      this.firstName = firstName;
      this.lastName = lastName;
    });
  };

  @action
  savePhone = phoneNumber => {
    return this.save({ phone_number: phoneNumber }).then(() => {
      this.phone = phoneNumber;
    });
  };

  @action
  savePassword = (oldPassword, newPassword) => {
    return put(`/api/v1/patients/${this.id}/update_password`, {
      body: {
        new_password: newPassword,
        old_password: oldPassword
      },
      hideNotify: true
    }).then(resp => {
      window.authenticationToken = resp.data.token;
    });
  };
}

export default CurrentPatientStore;
