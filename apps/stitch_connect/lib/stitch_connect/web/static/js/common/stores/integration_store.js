/**
 * Integration store
 *
 * This store keeps track of integrations of the app.
 */

import { observable, action, computed } from "mobx";
import find from "lodash/find";

class IntegrationStore {
  @observable integrations = [];
  @observable integrationConfigs = [];

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  loadIntegrations = () => {
    return get(`/api/v1/integrations`).then(response => {
      this.integrations = response.data;
      get("/api/v1/integration-configs").then(configs_response => {
        this.integrationConfigs = configs_response.data;
      });
    });
  };

  @action
  removeConfig = id => {
    return remove(`/api/v1/integration-configs/${id}`).then(response => {
      const index = this.integrationConfigs.findIndex(c => c.id === id);

      if (index > -1) {
        this.integrationConfigs.splice(index, 1);
      }
    });
  };

  @action
  createNewIntegration = params => {
    return post(
      `/api/v1/integrations/${params.integrationId}/integration-config`,
      {
        body: {
          group_id: params.groupId,
          settings: params.settings
        }
      }
    )
      .then(response => {
        this.integrationConfigs.push(response.data);
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
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
