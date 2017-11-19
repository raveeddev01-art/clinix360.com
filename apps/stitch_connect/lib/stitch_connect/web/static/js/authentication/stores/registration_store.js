import { observable, action } from "mobx";
import isEmail from "validator/lib/isEmail";
import Cookies from "js-cookie";

class RegistrationStore {
  @observable verified = false;

  @observable userId = "";
  @observable email = "";
  @observable firstname = "";
  @observable lastname = "";
  @observable username = "";
  @observable password = "";
  @observable pin = "";
  @observable phone = "";

  @observable teamname = "";
  @observable teamId = "";
  @observable teamurl = "";

  @observable sendInvites = false;
  @observable invites = [];

  @observable saving = false;

  @action
  setCookie = (userId, email) => {
    Cookies.set(
      "registration",
      {
        userId,
        email
      },
      { expires: 1 }
    ); // expires in a day
    this.userId = userId;
    this.email = email;
  };

  @action
  verifyCookie = () => {
    const cookieValues = Cookies.getJSON("registration");
    const userId = cookieValues && cookieValues.userId;
    const email = cookieValues && cookieValues.email;
    if (userId && email) {
      this.userId = userId;
      this.email = email;
      return true;
    }

    return false;
  };

  @action
  createTeam = () => {
    this.saving = true;
    return post(`/api/v1/teams`, {
      body: {
        name: this.teamname,
        url: this.teamurl
      }
    })
      .then(response => {
        let emails = [];

        this.teamId = response.data.id;
        this.teamurl = response.data.slug;

        if (this.sendInvites) {
          emails = this.invites.filter(isEmail).map(email => email.trim());
        }
        return patch(`/api/v1/users/${this.userId}/complete-onboarding`, {
          body: {
            first_name: this.firstname,
            last_name: this.lastname,
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
        window.location.href = `https://${this.teamurl}.${applicationHost}`;
      })
      .catch(err => {
        this.saving = false;
        throw err;
      });
  };
}

const registrationStore = new RegistrationStore();
export default registrationStore;
