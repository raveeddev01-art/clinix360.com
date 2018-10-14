import isFunction from "lodash/fp/isFunction";

class MessageCache {
  //
  // cache = {
  //   group_id_1: [],
  //   group_id_2: []
  // }
  //
  // Add index to avoid calling findIndex on array on update
  //
  constructor() {
    this.cache = {};
  }

  addBatchToCache(groupId, messages) {
    console.log(
      "MessageCache: cached messages for group",
      groupId,
      messages.length
    );
    this.cache[groupId] = messages;
  }

  addOneToCache(groupId, message) {
    console.log("MessageCache: cached one message for group", groupId);
    this.cache[groupId].push(message);
  }

  getCache(groupId) {
    console.log(
      "MessageCache: fetched cache for group",
      groupId,
      this.cache[groupId].length
    );
    return this.cache[groupId];
  }

  /* Takes message with `id` and `group_id` attributes and an optional
   * `customAttributes` object.
   * if `customAttributes` is not provided, replaces the message.
   * Returns `null` if message cannot be found based on `group_id` and `id`.
   *
   * updateCachedMessage({id: messageId, group_id: groupId}, {custom_attr: 42})
   */
  updateCachedMessage(groupId, messageId, messageAttributes) {
    console.log("MessageCache: update", groupId, messageId, messageAttributes);
    const groupMessages = this.cache[groupId];

    if (!groupMessages) {
      console.warn(`Group ${groupId} is not cached`);
      return null;
    }

    const messageIndex = groupMessages.findIndex(m => m.id === messageId);

    if (messageIndex === -1) {
      return null;
    }

    let updatedAttributes;

    if (isFunction(messageAttributes)) {
      updatedAttributes = messageAttributes(groupMessages[messageIndex]);
    } else {
      updatedAttributes = messageAttributes;
    }

    Object.keys(updatedAttributes).forEach(key => {
      groupMessages[messageIndex][key] = updatedAttributes[key];
    });

    return this.cache;
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

  deleteMessage(groupId, messageId) {
    const groupMessages = this.cache[groupId];

    if (!groupMessages) {
      console.warn(`Group ${groupId} is not cached`);
      return null;
    }

    const messageIndex = groupMessages.findIndex(m => m.id === messageId);

    if (messageIndex === -1) {
      console.warn(`Message ${messageId} is not cached`);
      return null;
    }

    return groupMessages.splice(messageIndex, 1);
  }
}

export default MessageCache;
