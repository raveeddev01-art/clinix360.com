import { observable, action } from "mobx";

class InvitationStore {
  @observable loading = false;
  @observable invitations = [];

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  loadInvitations = () => {
    this.loading = true;
    get(`/api/v1/invitations`).then(resp => {
      const { data } = resp;
      this.invitations = data;

      this.loading = false;
    });
  };

  @action
  revokeInvitation = id => {
    return patch(`/api/v1/invitations/${id}/revoke`, {
      hideNotify: true
    }).then(() => {
      const index = this.invitations.findIndex(
        invitation => invitation.id === id
      );
      if (index > -1) {
        this.invitations.splice(index, 1);
      }
    });
  };

  @action
  resendInvitation = id => {
    return patch(`/api/v1/invitations/${id}/resend`, {
      hideNotify: true
    }).then();
  };
}

export default InvitationStore;
