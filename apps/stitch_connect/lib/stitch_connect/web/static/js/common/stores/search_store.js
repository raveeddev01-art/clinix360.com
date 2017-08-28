import { observable, action } from "mobx";

class SearchStore {
  @observable messages = [];

  @action
  searchMessages = query => {
    return post(
      `/api/v1/messages/search?q=${encodeURIComponent(query)}`
    ).then(result => {
      console.log(result);
    });
  };
}

export default SearchStore;
