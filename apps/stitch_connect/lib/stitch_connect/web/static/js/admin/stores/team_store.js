import { observable, action } from "mobx";

class TeamStore {
  @observable name = "";
  @observable id = "";
  @observable subdomain = "";
  @observable securityLockoutEnabled = false;
  @observable secondsToLockout = null;
  @observable openInvitationsEnabled = false;

  constructor(props) {
    this.name = props.teamName;
    this.id = props.teamId;
    this.subdomain = props.subdomain;
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
