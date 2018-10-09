class MessageCache {
  //
  // cache = {
  //   group_id_1: [],
  //   group_id_2: []
  // }
  //
  constructor() {
    this.cache = {};
  }

  addBatchToCache(groupId, messages) {
    console.log("MessageCache: cached messages for group", groupId);
    this.cache[groupId] = messages;
  }

  addOneToCache(groupId, message) {
    console.log("MessageCache: cached one message for group", groupId);
    this.cache[groupId].push(message);
  }

  getCache(groupId) {
    console.log("MessageCache: fetched cache for group", groupId);
    return this.cache[groupId];
  }

  hasLoadedGroup(groupId) {
    return !!this.cache[groupId];
  }

  addNew(newMessage) {
    const groupId = newMessage.group_id;
    if (this.cache[groupId]) {
      console.log("MessageCache: added new message for group", groupId);
      // this.cache[groupId] = [];
      this.cache[groupId].unshift(newMessage);
    }
  }
}

export default MessageCache;
