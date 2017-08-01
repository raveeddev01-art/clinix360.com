import { observable, action } from "mobx";
import { Presence } from "phoenix";

class TeamStore {
  @observable loading = false;
  @observable name = "";
  @observable id = "";
  @observable subdomain = "";
  @observable securityLockoutEnabled = false;
  @observable secondsToLockout = null;
  @observable openInvitationsEnabled = false;
  @observable users = [];
  @observable offlineUsers = [];
  @observable onlineUsers = [];

  rawOnlineUsers = {};

  @action
  loadTeam = id => {
    this.loading = true;
    get(`/api/v1/teams/${id}`).then(resp => {
      const { data } = resp;
      this.id = data.id;
      this.name = data.name;
      this.securityLockoutEnabled = data.security_lockout;
      this.openInvitationsEnabled = data.open_invitations_enabled;
      this.secondsToLockout = data.seconds_to_lockout;

      this.loadUsers();

      this.loading = false;
    });
  };

  @action
  editTeamName = newName => {
    return put(`/api/v1/teams/${this.id}`, {
      body: { name: newName }
    }).then(response => {
      notify.show("Team name updated");
      this.name = newName;
    });
  };

  @action
  editSecurityLockout = (enabled, secondsToLockout) => {
    return put(`/api/v1/teams/${this.id}/update-security-lockout-time`, {
      body: { enabled, seconds_to_lockout: parseInt(secondsToLockout, 10) }
    }).then(response => {
      notify.show("Security lockout settings updated");
      this.securityLockoutEnabled = enabled;
      this.secondsToLockout = secondsToLockout;
    });
  };

  @action
  deleteTeam = () => {
    return remove(`/api/v1/teams/${this.id}`).then(response => {
      notify.show("Your team has been deleted");
      window.location.href = `https://${applicationHost}`;
    });
  };

  @action
  updateOpenInvitation = enabled => {
    return put(`/api/v1/teams/${this.id}/update-open-invitation`, {
      body: { enabled }
    }).then(response => {
      notify.show("Invitation settings updated");
      this.openInvitationsEnabled = enabled;
    });
  };

  loadUsers = () => {
    get("/api/v1/users").then(response => {
      this.users = response.data;
      this.connectPresence();
    });
  };

  connectPresence = () => {
    let lobby = socket.channel(`team:lobby:${this.id}`, {});

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
}

const store = new TeamStore();
export default store;
