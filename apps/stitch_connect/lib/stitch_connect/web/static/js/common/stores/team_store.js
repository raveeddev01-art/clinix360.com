import { observable, action } from "mobx";

class TeamStore {
  @observable loading = false;
  @observable name = "";
  @observable id = "";
  @observable slug = "";
  @observable securityLockoutEnabled = false;
  @observable secondsToLockout = null;
  @observable openInvitationsEnabled = false;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

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
      this.slug = data.slug;
      this.loading = false;
    });
  };

  @action
  editTeamName = name => {
    const { sidemenuStore } = this.rootStore;

    return put(`/api/v1/teams/${this.id}`, {
      body: { name },
      hideNotify: true
    }).then(() => {
      this.name = name;
      sidemenuStore.teamName = name;
    });
  };

  @action
  editSecurityLockout = (enabled, secondsToLockout) => {
    return put(`/api/v1/teams/${this.id}/update-security-lockout-time`, {
      body: { enabled, seconds_to_lockout: parseInt(secondsToLockout, 10) },
      hideNotify: true
    }).then(() => {
      this.securityLockoutEnabled = enabled;
      this.secondsToLockout = secondsToLockout;
    });
  };

  @action
  deleteTeam = () => {
    return remove(`/api/v1/teams/${this.id}`).then(() => {
      notify.show("Your team has been deleted");
      window.location.href = `https://${applicationHost}`;
    });
  };

  @action
  updateOpenInvitation = enabled => {
    return put(`/api/v1/teams/${this.id}/update-open-invitation`, {
      body: { enabled },
      hideNotify: true
    }).then(() => {
      this.openInvitationsEnabled = enabled;
    });
  };

  @action
  onRenamed = ({ name }) => {
    this.name = name;
  };
}

export default TeamStore;
