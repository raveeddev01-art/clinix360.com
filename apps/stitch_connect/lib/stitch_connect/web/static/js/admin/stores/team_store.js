import { observable, action } from "mobx";

// @TODO handle error response on utils/fetch
class TeamStore {
  @observable name = "";
  @observable id = "";

  constructor(props) {
    this.name = props.teamName;
    this.id = props.teamId;
  }

  @action
  editTeamName = newName => {
    return put(`/api/v1/teams/${this.id}`, {
      body: { name: newName }
    }).then(response => {
      console.log(response);
      this.name = newName;
    });
  };
}

let teamStore;
const store = {
  instance() {},
  get instance() {
    return teamStore;
  },
  set instance(props) {
    teamStore = new TeamStore(props);
  }
};

export default store;
export { TeamStore };
