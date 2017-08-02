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

  @action
  verifyInvitation = token => {
    this.token = token;
    return get(`/api/v1/invitations/${token}`).then(resp => {
      console.log(resp.data);
    });
  };

  @action
  completeInvitation = () => {
    return post(`/api/v1/invitations/${this.token}`).then(resp => {
      console.log(resp.data);
      window.location.href = `https://${subdomain}.${applicationHost}/login`;
    });
  };
}

const store = new InvitationStore();
export default store;
