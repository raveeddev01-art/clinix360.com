import { observable, computed, action } from "mobx";
import { Presence } from "phoenix";

class SidemenuStore {
  @observable teamName = "";
  @observable subdomain = "";
  @observable teamId = "";
  @observable groups = [];
  @observable users = [];
  @observable currentGroup = null;

  constructor(rootStore, props) {
    this.rootStore = rootStore;
    this.teamName = props.teamName;
    this.teamId = props.teamId;
    this.subdomain = props.subdomain;
    this.users = props.dm_users || [];

    this.loadGroups();
    this.loadUsers();
  }

  @action
  loadGroups = () => {
    get("/api/v1/groups").then(response => {
      this.groups = response.data;
    });
  };

  @computed
  get favoriteGroups() {
    return this.groups.filter(group => group.favorite);
  }

  @computed
  get usernameMap() {
    const map = {};
    this.users.forEach(user => {
      map[user.username] = user;
    });
    return map;
  }

  @action
  updateGroupData = (id, data) => {
    const index = this.groups.findIndex(group => group.id === id);
    if (index > -1) {
      Object.assign(this.groups[index], data);
    }
  };

  loadUsers = () => {
    get("/api/v1/users").then(response => {
      this.users = response.data;
    });
  };

  selectRoom = room => {
    this.selectedRoom = room;
  };
}

export default SidemenuStore;
