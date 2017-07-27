import { observable, action } from "mobx";

// @TODO handle error response on utils/fetch
class TeamStore {
  @observable name = "";
  @observable id = "";
  @observable securityLockoutEnabled = false;
  @observable secondsToLockout = null;
  @observable openInvitationsEnabled = false;

  constructor(props) {
    this.name = props.teamName;
    this.id = props.teamId;
    get(`/api/v1/teams/${this.id}`).then(resp => {
      const { data } = resp;
      this.securityLockoutEnabled = data.security_lockout;
      this.openInvitationsEnabled = data.open_invitations_enabled;
      this.secondsToLockout = data.seconds_to_lockout;
    });
  }

  @action
  editTeamName = newName => {
    return put(`/api/v1/teams/${this.id}`, {
      body: { name: newName }
    }).then(response => {
      this.name = newName;
    });
  };

  @action
  editSecurityLockout = (enabled, secondsToLockout) => {
    return put(`/api/v1/teams/${this.id}/update-security-lockout-time`, {
      body: { enabled, seconds_to_lockout: parseInt(secondsToLockout, 10) }
    }).then(response => {
      this.securityLockoutEnabled = enabled;
      this.secondsToLockout = secondsToLockout;
    });
  };

  @action
  deleteTeam = () => {
    return remove(`/api/v1/teams/${this.id}`).then(response => {
      const regExp = /.+\.(.*)/;
      const match = re.exec(window.location.host);
      window.location.href = `https://${match[1]}`;
    });
  };

  @action
  updateOpenInvitation = enabled => {
    return put(`/api/v1/teams/${this.id}/update-open-invitation`, {
      body: { enabled }
    }).then(response => {
      this.openInvitationsEnabled = enabled;
    });
  };
}

let teamStore;
const store = {
  instance() {},
  get instance() {
    return teamStore;
  },
  set instance(props) {
    teamStore = new TeamStore(props);
  }
};

export default store;
export { TeamStore };
