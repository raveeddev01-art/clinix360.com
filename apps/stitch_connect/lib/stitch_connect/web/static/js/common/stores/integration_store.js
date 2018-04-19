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
    this.loadIntegrations();
  }

  @action
  createNewIntegration = params => {
    return post(`/api/v1/integrations`, {
      body: {
        group_id: params.groupId,
        app_id: params.appId
      }
    })
      .then(response => {
        this.integrations.push(response.data);
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  };

  @action
  loadAppCatalog = () => {
    return get(`/api/v1/apps`).then(response => {
      this.apps = response.data;
    });
  };

  @action
  loadIntegrations = () => {
    return get(`/api/v1/integrations`).then(response => {
      this.integrations = response.data;
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

  @action
  forApp = appName => {
    const app = this.apps.filter(app => app.name === appName)[0];

    // If this app name doesn't exist, just return an empty array.
    if (app === undefined) {
      return [];
    }

    return this.integrations.filter(
      integration => integration.app_id === app.id
    );
  };
}

export default IntegrationStore;
