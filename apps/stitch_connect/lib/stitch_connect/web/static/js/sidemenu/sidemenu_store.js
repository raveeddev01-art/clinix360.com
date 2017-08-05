import { observable, computed } from "mobx";
import { Presence } from "phoenix";

class SidemenuStore {
  @observable teamName = "";
  @observable subdomain = "";
  @observable teamId = "";
  @observable favoriteGroups = [];
  @observable groups = [];
  @observable users = [];
  @observable offlineUsers = [];
  @observable onlineUsers = [];
  @observable currentGroup = null;

  rawOnlineUsers = {};

  constructor(props) {
    this.teamName = props.teamName;
    this.teamId = props.teamId;
    this.subdomain = props.subdomain;
    this.loadGroups();
    this.loadUsers();
  }

  loadGroups = () => {
    get("/api/v1/groups").then(response => {
      this.groups = response.data;
    });
  };

  loadUsers = () => {
    get("/api/v1/users").then(response => {
      this.users = response.data;
      this.connectPresence();
    });
  };

  connectPresence = () => {
    let lobby = socket.channel(`team:lobby:${this.teamId}`, {});

    lobby.on("presence_state", state => {
      this.rawOnlineUsers = Presence.syncState(this.rawOnlineUsers, state);
      this.updatePresences();
    });

    lobby.on("presence_diff", diff => {
      this.rawOnlineUsers = Presence.syncDiff(this.rawOnlineUsers, diff);
      this.updatePresences();
    });

    lobby.join();
  };

  updatePresences = () => {
    this.onlineUsers = Presence.list(this.rawOnlineUsers, this.listBy);
    this.offlineUsers = _.differenceBy(this.users, this.onlineUsers, "id");
  };

  listBy = (id, { metas: [first, ...rest] }) => {
    return first;
  };

  selectRoom = room => {
    this.selectedRoom = room;
  };
}

var sidemenuStore;

const store = {
  instance() {},
  get instance() {
    return sidemenuStore;
  },
  set instance(props) {
    sidemenuStore = new SidemenuStore(props);
  }
};

export default store;
export { SidemenuStore };
