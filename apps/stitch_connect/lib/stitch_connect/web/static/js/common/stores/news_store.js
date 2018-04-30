/**
 * News store
 *
 * This store keeps track of News stories of the app.
 */

import { observable, action, computed } from "mobx";
import find from "lodash/find";

class NewsStore {
  @observable news = [];
  @observable latestNewsDate = undefined;

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.loadNewsStories();
  }

  @action
  loadNewsStories = () => {
    return get(`/api/v1/news`).then(response => {
      this.news = response.data;
      this.latestNewsDate = this.news[0].inserted_at;
    });
  };

  @action
  unreadNewsCount = () => {
    if (currentUser.whatsNewLastSeenAt === null) {
      return this.news.length;
    }

    return 0;
  };

  @action
  markAsRead = () => {
    console.log("Mark as read");
    // return post("/api/v1/users/send-confirmation-code", {
    //   body: { id: response.data.id }
    // }).then(() => {
    //   this.props.history.push("/signup/confirmation-code");
    //   this.setState({ loading: false });
    // });
  };
}

export default NewsStore;
