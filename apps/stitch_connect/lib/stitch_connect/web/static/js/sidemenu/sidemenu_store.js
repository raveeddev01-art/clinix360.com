import { observable, computed } from "mobx";
import { Presence } from "phoenix";

class SidemenuStore {
  @observable teamName = "";
  @observable subdomain = "";
  @observable teamId = "";
  @observable favoriteRooms = [];
  @observable rooms = [];
  @observable users = [];
  @observable onlineUsers = [];

  rawOnlineUsers = {};

  constructor(props) {
    this.teamName = props.teamName;
    this.teamId = props.teamId;
    this.subdomain = props.subdomain;
    this.loadRooms();
    this.loadUsers();
  }

  loadRooms = () => {
    get("/api/v1/rooms").then(response => {
      this.rooms = response.data;
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
  };

  listBy = (id, { metas: [first, ...rest] }) => {
    return first;
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
