import { observable, action, computed } from "mobx";
import { Presence } from "phoenix";

class MembersStore {
  @observable loading = false;
  @observable teamId = "";
  @observable users = [];
  @observable rawOnlineUsers = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @computed
  get onlineUsers() {
    return this.users.filter(u => !!this.rawOnlineUsers[`${u.id}`]);
  }

  @computed
  get offlineUsers() {
    return this.users.filter(u => !this.rawOnlineUsers[`${u.id}`]);
  }

  getUser = userId => this.users.find(u => u.id === userId);

  @action
  loadUsers = teamId => {
    this.teamId = teamId;
    get("/api/v1/users").then(response => {
      this.users = response.data;
      this.connectPresence();
    });
  };

  @action
  activateUser = userId => {
    return post(`/api/v1/users/${userId}/activate`).then(() => {
      const user = this.getUser(userId);
      if (user) {
        user.disabled = false;
      }
      notify.show("Account activated.");
    });
  };

  @action
  deactivateUser = userId => {
    return post(`/api/v1/users/${userId}/deactivate`).then(() => {
      const user = this.getUser(userId);
      if (user) {
        user.disabled = true;
      }
      notify.show("Account deactivated.");
    });
  };

  @action
  revokeAdmin = userId => {
    return put(`/api/v1/users/${userId}/revoke-admin`).then(() => {
      const user = this.getUser(userId);
      if (user) {
        user.roles = ["member"];
      }
      notify.show("Revoked admin role.");
    });
  };

  @action
  promoteAdmin = userId => {
    return put(`/api/v1/users/${userId}/promote-admin`).then(() => {
      const user = this.getUser(userId);
      if (user) {
        user.roles = ["admin"];
      }
      notify.show("Promoted to admin.");
    });
  };

  connectPresence = () => {
    // @TODO refactor presence stuff to presence_store
    const lobby = this.rootStore.channelStore.teamLobbyChannel;

    lobby.on("presence_state", this.onPresenceState);
    lobby.on("presence_diff", this.onPresenceDiff);
  };

  @action
  onPresenceState = state => {
    this.rawOnlineUsers = Presence.syncState(this.rawOnlineUsers, state);
  };

  @action
  onPresenceDiff = diff => {
    this.rawOnlineUsers = Presence.syncDiff(this.rawOnlineUsers, diff);
  };
}

export default MembersStore;
