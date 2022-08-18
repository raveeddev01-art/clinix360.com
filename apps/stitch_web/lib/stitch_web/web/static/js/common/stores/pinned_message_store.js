import { observable, computed, action } from "mobx";
import { stringify } from "qs";

class PinnedMessageStore {
  @observable messages = [];
  @observable loading = false;
  @observable hasMore = true;
  skip = 0;
  limit = 10;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @computed
  get groupId() {
    return this.rootStore.groupStore.group.id;
  }

  @computed
  get isEmpty() {
    return this.messages.length === 0;
  }

  @action
  reset() {
    this.skip = 0;
    this.loading = false;
    this.hasMore = true;
    this.messages = [];

    if (this.collapsed) {
      this.loadMore();
    }
  }

  @action
  onCollapse = collapsed => {
    this.collapsed = collapsed;
    if (collapsed && this.messages.length === 0 && this.hasMore) {
      this.loadMore();
    }
  };

  @action
  loadMore() {
    if (this.loading || !this.hasMore) {
      return;
    }

    const params = stringify({
      skip: this.skip,
      limit: this.limit,
      group_id: this.groupId,
      fetchUsers: false
    });

    this.loading = true;

    get(`/api/v1/pinned_messages?${params}`).then(response => {
      this.loading = false;

      const { data, meta } = response.data;

      const users = this.rootStore.usersStore.users.toJS();
      const messages = data.map(msg => ({
        ...msg,
        user: users.find(u => u.id === msg.user_id)
      }));

      this.messages = this.messages.concat(messages);
      this.hasMore = this.messages.length < meta.count;
      this.skip = meta.skip + meta.limit;
    });
  }

  @action
  add(message) {
    this.messages.splice(this.indexOf(message), 0, message);
  }


  indexOf(message) {
    return this.messages.findIndex(m => 
      new Date(m.inserted_at).valueOf() < new Date(message.inserted_at).valueOf()
    );
  }



  @action
  remove(id) {
    const index = this.messages.findIndex(m => m.id === id);

    if (index > -1) {
      this.messages.splice(index, 1);
    }
  }
}

export default PinnedMessageStore;
