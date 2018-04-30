/**
 * News store
 *
 * This store keeps track of News stories of the app.
 */

import { observable, action, computed } from "mobx";

class NewsStore {
  @observable news = [];
  @observable whatsNewLastSeenAt = null;

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.loadNewsStories();
    this.whatsNewLastSeenAt = currentUser.whatsNewLastSeenAt;
  }

  @action
  loadNewsStories = () => {
    return get(`/api/v1/news`).then(response => {
      this.news = response.data;
    });
  };

  @computed
  get unreadNewsCount() {
    if (this.whatsNewLastSeenAt === null) {
      return this.news.length;
    }

    const newStories = this.news.filter(
      news => news.inserted_at > this.whatsNewLastSeenAt
    );
    return newStories.length;
  }

  @computed
  get unreadNewsLabel() {
    if (this.unreadNewsCount > 9) {
      return "9+";
    }

    return this.unreadNewsCount;
  }

  @action
  markAsRead = () => {
    return post("/api/v1/news/mark-as-read", {
      body: {}
    }).then(response => {
      this.whatsNewLastSeenAt = response.data.whats_new_last_seen_at;
    });
  };
}

export default NewsStore;
