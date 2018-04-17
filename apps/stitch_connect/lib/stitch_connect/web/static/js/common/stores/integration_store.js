/**
 * Integration store
 *
 * This store keeps track of integrations of the app.
 */

import { observable, action, computed } from "mobx";
import find from "lodash/find";

class IntegrationStore {
  @observable loaded = false;

  // Catalog of all the app we support at Stitch.
  @observable apps = [];
  @observable integrations = [];

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.loadAppCatalog();
  }

  @action
  loadAppCatalog = () => {
    return get(`/api/v1/apps`).then(response => {
      this.apps = response.data;
    });
  };

  @action
  disable = id => {
    return post(`/api/v1/integrations/${id}/disable`).then(response => {
      const index = this.integrations.findIndex(c => c.id === id);
      this.integrations[index].enabled = false;
    });
  };

  @action
  enable = id => {
    return post(`/api/v1/integrations/${id}/enable`).then(response => {
      const index = this.integrations.findIndex(c => c.id === id);
      this.integrations[index].enabled = true;
    });
  };
}

export default IntegrationStore;
