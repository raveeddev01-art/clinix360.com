import LoginStore from "./login_store";

class WebsiteStore {
  constructor(props) {
    this.appParams = Object.assign({}, props);
    this.createStores(this.appParams);
  }

  createStores(appParams) {
    this.loginStore = new LoginStore(this, appParams);
  }
}

export default WebsiteStore;
