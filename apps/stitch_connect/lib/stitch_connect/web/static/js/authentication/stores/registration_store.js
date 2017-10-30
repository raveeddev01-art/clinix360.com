import { observable } from "mobx";

class RegistrationStore {
  @observable userId = "";
  @observable email = "";
  @observable firstName = "";
  @observable lastName = "";
  @observable username = "";
  @observable password = "";
  @observable pin = "";

  @observable teamName = "";
  @observable teamSlug = "";
  @observable teamId = "";
  @observable teamUrl = "";
}

const registrationStore = new RegistrationStore();
export default registrationStore;
