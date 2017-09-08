import { observable, computed, action } from "mobx";

class SidemenuStore {
  @observable teamName = "";
  @observable subdomain = "";
  @observable teamId = "";
  @observable groups = [];
  @observable users = [];
  @observable currentGroup = null;
  @observable locked = false;
  @observable unlocking = false; // Flag that indicates if unlocking request is being made
  inactivityTimeout = -1;
  inactivityTimer = null;

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
      console.log(response);
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

  @action
  lock() {
    // TODO: POST `/api/v1/session-lock`
    this.locked = true;
  }

  /**
   * Unlock the session by calling backend api
   * 
   * @param {String} pin 
   */
  @action
  unlock(pin) {
    // TODO: POST `/api/v1/session-unlock`
    // In then response, cancel `unlocking` flag
    // In error response, show notification `Incorrect password`

    /*
    this.unlocking = true;
    post(`/api/v1/session-unlick`, { pin }).then(() => {
      this.locked = false;
    }, (error) => {
      notify.show(error);
    })
    .finally(() => {
      this.unlocking = false;
    })
    */

    // Mocking the api call using timeout
    this.unlocking = true;

    setTimeout(() => {
      this.unlocking = false;
      this.locked = false;
    }, 2000);
  }

  loadUsers = () => {
    get("/api/v1/users").then(response => {
      this.users = response.data;
    });
  };

  selectRoom = room => {
    this.selectedRoom = room;
  };

  getGroupById = id => this.groups.find(group => group.id === id);

  /**
   * Retrieve from the server timeout amount for which the user gets locked if he is inactive
   */
  getInactivityTimeout() {
    // TODO: Get from backend server

    this.inactivityTimeout = 60 * 60; // Default: 1 hour
  }

  startInactivityTimer() {
    if (this.locked) {
      return;
    }

    this.stopInactivityTimer();

    this.inactivityTimer = window.setTimeout(() => {
      this.lock();
      this.stopInactivityTimer();
    }, this.inactivityTimeout * 1000);
  }

  stopInactivityTimer() {
    if (this.inactivityTimer) {
      window.clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }
}

export default SidemenuStore;
