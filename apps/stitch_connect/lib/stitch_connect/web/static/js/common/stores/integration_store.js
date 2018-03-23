/**
 * Integration store
 *
 * This store keeps track of integrations of the app.
 */

import { observable, action } from "mobx";

class IntegrationStore {
  @observable integrations = [];

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  loadIntegrations = () => {
    return get(`/api/v1/integrations`).then(response => {
      this.integrations = response.data;
    });
  };
}

export default IntegrationStore;
