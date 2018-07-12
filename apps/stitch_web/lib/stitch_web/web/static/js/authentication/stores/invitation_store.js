import { observable, action } from "mobx";
import history from "lib/history";

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
    const url = `/api/v1/invitations/${this.token}`;
    return get(url, {
      hideNotify: true
    }).then(resp => {
      this.email = resp.data.email;
      this.invitationId = resp.data.id;
      this.userId = resp.data.user_id;
      this.verified = true;
    });
  };

  @action
  completeInvitation = asPatient => {
    const completeUrl = asPatient
      ? `/api/v1/patient/invitations/accept/${this.token}`
      : `/api/v1/invitations/accept/${this.token}`;

    this.saving = true;
    return post(completeUrl, {
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
        if (asPatient) {
          window.location = "/patient";
        } else {
          history.push("/apps");
        }
      })
      .catch(err => {
        this.saving = false;
        throw err;
      });
  };
}

const store = new InvitationStore();
export default store;
