import { observable, action, computed } from "mobx";
import { filterUsers, isFullMember } from "lib/utils";

const KEYWORDS = {
  MENTION: ["from:", "to:"],
  ROOM: ["in:"],
  DATE: ["before:", "after:", "on:", "during:"]
};

class SearchStore {
  @observable messages = [];
  @observable loading = false;
  @observable hasMore = false;
  @observable orderBy = "recency"

  constructor(rootStore) {
    this.rootStore = rootStore;

    this.limit = 10;
    this.query = "";
  }

  @computed
  get queryIsBlank() {
    return !this.query.trim();
  }

  @computed
  get isEmpty() {
    return this.messages.length === 0;
  }

  checkKeyword(type, word) {
    if (!KEYWORDS[type]) {
      return null;
    }

    const result = KEYWORDS[type].find(keyword => word.indexOf(keyword) === 0);

    if (result) {
      return [result, word.replace(result, "")];
    }

    return null;
  }

  checkMention = word => {
    const filter = this.checkKeyword("MENTION", word);
    if (filter) {
      const { usersStore } = this.rootStore;
      const items = filterUsers(
        isFullMember(currentUser)
          ? usersStore.activatedUsers
          : usersStore.connectedAndActivatedUsers,
        filter[1].replace("@", "")
      )
        .filter(user => !user.disabled)
        .map(user => ({
          id: user.id,
          type: "user",
          orderKey: user.full_name.toLowerCase(),
          value: `@${user.username}`
        }));

      return {
        items,
        keyword: filter[0],
        dropdownTitle: "People",
        isDropdownVisible: true,
        isDatepickerVisible: false
      };
    }

    return false;
  };

  checkRoom = word => {
    const filter = this.checkKeyword("ROOM", word);
    if (filter) {
      const { groupsStore } = this.rootStore;
      const groupTypeIndicator = filter[1].substr(0, 1);
      const items = groupsStore.groups
        .filter(group => {
          let slug = group.slug;
          if (group.hidden || !group.joined || group.id === 0) {
            return false;
          }

          if (
            (group.type === "dm" || group.type === "multi_dm") &&
            groupTypeIndicator === "#"
          ) {
            return false;
          }

          if (group.type === "regular" && groupTypeIndicator === "@") {
            return false;
          }

          if (group.type === "dm" || group.type === "multi_dm") {
            slug = groupsStore.getDMNameWithUsernames(group);
          }

          const query = filter[1].replace(/[#@]/g, "");
          return slug.indexOf(query) > -1;
        })
        .map(group => {
          return {
            id: group.id,
            type: "group",
            groupType: group.type === "regular" ? "Rooms" : "Direct Messages",
            orderKey: (group.users.length === 1 && group.type === "dm"
              ? ""
              : group.type === "regular"
                ? group.name
                : groupsStore.getGroupName(group).toLowerCase()
            ).toLowerCase(),
            value:
              group.type === "regular"
                ? `#${group.slug}`
                : `@${groupsStore.getDMNameWithUsernames(group)}`
          };
        });

      return {
        items,
        keyword: filter[0],
        dropdownTitle: "Conversations",
        isDropdownVisible: true,
        isDatepickerVisible: false
      };
    }

    return false;
  };

  checkDate = word => {
    const filter = this.checkKeyword("DATE", word);
    if (filter) {
      return {
        keyword: filter[0],
        dateChunk: filter[1],
        isDropdownVisible: false,
        isDatepickerVisible: true
      };
    }

    return false;
  };

  checkWord = word => {
    return (
      this.checkDate(word) || this.checkRoom(word) || this.checkMention(word)
    );
  };

  parseQuery(query) {
    return query
      .split(" ")
      .map(word => {
        const result = this.checkWord(word);
        if (result) {
          if (result.items) {
            const resultItem = result.items.find(
              item => word === `${result.keyword}${item.value}`
            );
            if (resultItem) {
              return `${result.keyword}${resultItem.id}`;
            }
          }
        }

        return word;
      })
      .join(" ");
  }

  @action
  reset() {
    this.query = "";
    this.messages = [];
    this.loading = false;
    this.hasMore = true;
  }

  @action
  setQuery(query) {
    this.reset();
    this.query = this.parseQuery(query);
    this.loadMore();
  }

  @action
  setOrder(orderBy) {
    this.orderBy = orderBy;
    this.messages = [];
    this.hasMore = true;
    this.loading = false;
    this.loadMore();
  }

  @action
  loadMore() {
    if (this.loading || !this.hasMore || this.queryIsBlank) {
      return;
    }

    this.loading = true;

    post(`/api/v1/messages/search?fetchUsers=false`, {
      body: {
        term: this.query,
        skip: this.messages.length,
        limit: this.limit,
        search_order: this.orderBy,
        v: 2
      }
    }).then(response => {
      this.loading = false;

      const { data } = response;
      const users = this.rootStore.usersStore.users.toJS();
      const messages = data.map(msg => ({
        ...msg,
        user: users.find(u => u.id === msg.user_id)
      }));

      this.messages = this.messages.concat(messages);
      this.hasMore = data.length === this.limit;
    });
  }
}

export default SearchStore;
