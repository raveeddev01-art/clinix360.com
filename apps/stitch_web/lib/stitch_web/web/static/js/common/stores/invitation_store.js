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

  @action
  sendInvites = (emails, groupId, role) => {
    switch (role) {
      case "member":
        return this.inviteFullMembers(emails);
      case "single-room-guest":
        return this.inviteSingleRoomGuests(emails, groupId);
      case "multi-room-guest":
        return this.inviteMultiRoomGuests(
          emails,
          groupId
            .split(",")
            .filter(g => g)
            .map(g => parseInt(g, 10))
        );
      default:
        return Promise.reject("Unrecongized role");
    }
  };

  @action
  inviteFullMembers = emails => {
    return post(`/api/v1/invitations`, {
      hideNotify: true,
      body: { email_collection: emails.join(",") }
    });
  };

  @action
  inviteSingleRoomGuests = (emails, groupId) => {
    return post("/api/v1/invitations/single-room-guests", {
      hideNotify: true,
      body: {
        emails,
        group_id: groupId
      }
    });
  };

  @action
  inviteMultiRoomGuests = (emails, groupIds) => {
    return post("/api/v1/invitations/multi-room-guests", {
      hideNotify: true,
      body: {
        emails,
        group_ids: groupIds
      }
    });
  };

  @action
  onInvitationSent = data => {
    const invitationIndex = this.invitations.findIndex(
      inv => inv.id === data.id
    );
    if (invitationIndex > -1) {
      this.invitations.splice(invitationIndex, 1);
    }
    this.invitations.push(data);
  };

  @action
  onInvitationRevoked = data => {
    const invitationIndex = this.invitations.findIndex(
      inv => inv.id === data.id
    );
    if (invitationIndex > -1) {
      this.invitations.splice(invitationIndex, 1);
    }
  };
}

export default InvitationStore;
