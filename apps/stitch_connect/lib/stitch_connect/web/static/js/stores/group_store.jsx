import { observable, action } from "mobx";
import { Presence } from "phoenix";
import _ from "lodash";

class GroupStore {
  @observable loading = false;
  @observable name = "";
  @observable id = "";
  @observable slug = "";
  @observable description = "";
  @observable public = true;
  @observable joined = false;
  @observable users = [];

  @action
  loadGroupBySlug = slug => {
    this.loading = true;
    get(`/api/v1/groups?slug=${slug}`).then(resp => {
      const { data } = resp;
      this.id = data.id;
      this.name = data.name;
      this.slug = data.slug;
      this.description = data.description;
      this.public = data.public;

      this.loading = false;
    });
  };

  @action
  togglePublic = value => {
    return post(`/api/v1/groups/${this.id}/toggle-public`, {
      body: { public: value }
    }).then(resp => {
      this.public = !this.public;
    });
  };

  @action
  loadUsers = () => {
    return get(`/api/v1/groups/${this.id}/users`).then(resp => {
      this.users = resp.data;
      return resp.data;
    });
  };

  @action
  saveUsers = members => {
    return post(`/api/v1/groups/${this.id}/invite`, {
      body: {
        user_ids: _.map(members, "id").join(",")
      }
    }).then(resp => {
      notify.show("Users invited to group");
    });
  };

  @action
  join = () => {
    return post(`/api/v1/groups/${this.id}/join`).then(resp => {
        this.joined = true;
      });
  };

  @action
  leave = () => {
    return post(`/api/v1/groups/${this.id}/leave`).then(resp => {
        this.joined = false;
      });
  };
}

const store = new GroupStore();
export default store;
