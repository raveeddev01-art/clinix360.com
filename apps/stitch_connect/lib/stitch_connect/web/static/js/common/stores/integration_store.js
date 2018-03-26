/**
 * Integration store
 *
 * This store keeps track of integrations of the app.
 */

import { observable, action, computed } from "mobx";
import find from "lodash/find";

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

  @action
  createNewIntegration = params => {
    console.log("Creating new integration");
    console.log(params);
    // START HERE SERGIO.
  };

  @computed
  get drChronoEnabled() {
    return (
      find(this.integrations, {
        name: "drchrono",
        enabled: true
      }) !== undefined
    );
  }

  @computed
  get drChronoIntegration() {
    return find(this.integrations, {
      name: "drchrono"
    });
  }
}

export default IntegrationStore;
