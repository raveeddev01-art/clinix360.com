import { observable, action } from "mobx";

class InvitationStore {
  @observable firstName = "";
  @observable lastName = "";
  @observable username = "";
  @observable password = "";
  @observable pin = "";
  @observable email = "";
  @observable teamName = "";
  @observable subdomain = "";
  @observable token = "";
  @observable userId = "";
  @observable invitationId = "";
  @observable verified = false;

  @action
  verifyInvitation = token => {
    this.token = token;
    return get(`/api/v1/invitations/${token}`).then(resp => {
      this.email = resp.data.email;
      this.invitationId = resp.data.id;
      this.userId = resp.data.user_id;
      this.verified = true;
    });
  };

  @action
  completeInvitation = () => {
    return post(`/api/v1/invitations/${this.token}`).then(resp => {
      console.log(resp.data);
      notify.show("Thanks for completing your profile.");
      window.location.href = `https://${subdomain}.${applicationHost}/login`;
    });
  };
}

const store = new InvitationStore();
export default store;
