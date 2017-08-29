import { observable, computed, action } from "mobx";

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

  @computed
  get singleDMGroupsMap() {
    const singleDMGroups = this.groups.filter(
      group => group.slug.indexOf("__dm:") === 0
    );
    const userMap = {};
    singleDMGroups.forEach(group => {
      const user = group.users.find(u => u.id !== currentUser.id);
      userMap[user ? user.id : currentUser.id] = group;
    });
    return userMap;
  }

  @computed
  get normalGroups() {
    return this.groups.filter(group => group.slug.indexOf("__dm:") === -1);
  }

  @computed
  get multiDMGroups() {
    return this.groups.filter(group => group.name === "__multi_dm_group__");
  }

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
  loadGroups = () => {
    get("/api/v1/groups").then(response => {
      this.groups = response.data;
    });
  };

  @action
  onNewGroup = newGroup => {
    this.groups.push(newGroup);
  };

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
