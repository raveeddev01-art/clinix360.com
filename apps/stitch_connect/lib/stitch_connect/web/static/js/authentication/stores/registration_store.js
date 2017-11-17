import { observable, action } from "mobx";
import { isEmail } from "util/validators";

class RegistrationStore {
  @observable userId = "";
  @observable email = "";
  @observable firstName = "";
  @observable lastName = "";
  @observable username = "";
  @observable password = "";
  @observable pin = "";
  @observable phone = "";

  @observable teamName = "";
  @observable teamId = "";
  @observable teamUrl = "";

  @observable sendInvites = false;
  @observable invites = [];

  @observable saving = false;

  @action
  createTeam = () => {
    this.saving = true;
    return post(`/api/v1/teams`, {
      body: {
        name: this.teamName,
        url: this.teamUrl
      }
    })
      .then(response => {
        let emails = [];

        this.teamId = response.data.id;
        this.teamUrl = response.data.slug;

        if (this.sendInvites) {
          emails = this.invites.filter(isEmail).map(email => email.trim());
        }
        return patch(`/api/v1/users/${this.userId}/complete-onboarding`, {
          body: {
            first_name: this.firstName,
            last_name: this.lastName,
            phone_number: this.phone,
            username: this.username,
            password: this.password,
            pin: this.pin,
            team_id: response.data.id,
            invites: emails
          }
        });
      })
      .then(() => {
        this.saving = false;
        window.location.href = `https://${this.teamUrl}.${applicationHost}`;
      })
      .catch(err => {
        this.saving = false;
        throw err;
      });
  };
}

const registrationStore = new RegistrationStore();
export default registrationStore;
