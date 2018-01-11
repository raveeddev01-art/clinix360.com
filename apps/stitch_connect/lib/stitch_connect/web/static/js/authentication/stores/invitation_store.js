import { observable, action } from "mobx";

class InvitationStore {
  @observable firstname = "";
  @observable lastname = "";
  @observable username = "";
  @observable password = "";
  @observable phone = "";
  @observable pin = "";
  @observable email = "";
  @observable teamName = "";
  @observable subdomain = "";
  @observable token = "";
  @observable userId = "";
  @observable invitationId = "";
  @observable verified = false;
  @observable inviteToken = "";

  @observable saving = false;

  @action
  verifyInvitation = () => {
    return get(`/api/v1/invitations/${this.token}`, {
      hideNotify: true
    }).then(resp => {
      this.email = resp.data.email;
      this.invitationId = resp.data.id;
      this.userId = resp.data.user_id;
      this.verified = true;
    });
  };

  @action
  completeInvitation = () => {
    this.saving = true;
    return post(`/api/v1/invitations/accept/${this.token}`, {
      body: {
        first_name: this.firstname,
        last_name: this.lastname,
        password: this.password,
        pin: this.pin,
        username: this.username,
        phone_number: this.phone
      },
      hideNotify: true
    })
      .then(() => {
        this.saving = false;
        window.location.href = "/apps";
      })
      .catch(err => {
        this.saving = false;
        throw err;
      });
  };
}

const store = new InvitationStore();
export default store;
