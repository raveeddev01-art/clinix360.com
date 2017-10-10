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
    patch(`/api/v1/invitations/${id}/revoke`).then(() => {
      const index = this.invitations.findIndex(
        invitation => invitation.id === id
      );
      if (index > -1) {
        const email = this.invitations[index].email;
        this.invitations.splice(index, 1);
        notify.show(`Invitation revoked from ${email}`);
      }
    });
  };

  @action
  resendInvitation = id => {
    patch(`/api/v1/invitations/${id}/resend`).then(() => {
      const index = this.invitations.findIndex(
        invitation => invitation.id === id
      );
      if (index > -1) {
        const email = this.invitations[index].email;
        notify.show(`Invitation resent to ${email}`);
      }
    });
  };
}

export default InvitationStore;
