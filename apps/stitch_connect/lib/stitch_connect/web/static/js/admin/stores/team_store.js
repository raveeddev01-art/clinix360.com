import { observable, action } from "mobx";

class TeamStore {
  @observable loading = false;
  @observable name = "";
  @observable id = "";
  @observable subdomain = "";
  @observable securityLockoutEnabled = false;
  @observable secondsToLockout = null;
  @observable openInvitationsEnabled = false;

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
}

const store = new TeamStore();
export default store;
