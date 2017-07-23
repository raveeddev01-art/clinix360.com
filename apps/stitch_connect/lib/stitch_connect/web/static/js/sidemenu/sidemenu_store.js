import { observable, computed } from "mobx";
import { Presence } from "phoenix";

class SidemenuStore {
  @observable teamName = "";
  @observable subdomain = "";
  @observable teamId = "";
  @observable favoriteRooms = [];
  @observable rooms = [];

  constructor(props) {
    this.teamName = props.teamName;
    this.teamId = props.teamId;
    this.subdomain = props.subdomain;
    this.loadRooms();
    this.connectPresence();
  }

  loadRooms = () => {
    get("/api/v1/rooms").then(response => {
      this.rooms = response.data;
    });
  };

  connectPresence = () => {
    let presences = {};
    let lobby = socket.channel("team:lobby:7", {});

    lobby.on("presence_state", state => {
      presences = Presence.syncState(presences, state);
      console.log("Presence State:", presences);
    });

    lobby.on("presence_diff", diff => {
      presences = Presence.syncDiff(presences, diff);
      console.log("Presence Diff:", presences);
    });

    lobby.join();
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
