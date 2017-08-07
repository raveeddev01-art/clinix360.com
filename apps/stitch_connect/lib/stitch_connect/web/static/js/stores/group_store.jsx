import { observable, action } from "mobx";
import { Presence } from "phoenix";

class GroupStore {
  @observable loading = false;
  @observable name = "";
  @observable id = "";
  @observable slug = "";
  @observable description = "";
  @observable public = true;
  @observable joined = false;

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
      body: {public: value}
    }).then(resp => {
        this.public = !this.public;
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
