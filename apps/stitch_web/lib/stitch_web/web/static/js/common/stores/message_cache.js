import isFunction from "lodash/fp/isFunction";
import uniqBy from "lodash/uniqBy";

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
        this.cache[groupId] = messages;
    }

    getCache(groupId) {
        const cachedGroupMessages = this.cache[groupId];
        if (!cachedGroupMessages) {
            return [];
        }
        return uniqBy(cachedGroupMessages, m => m.request_id || m.id);
    }

    /*
     * updateCachedMessage(messageId, groupId, {custom_attr: 42})
     */
    updateCachedMessage(groupId, messageId, messageAttributes) {
        const groupMessages = this.cache[groupId];

        if (!groupMessages) {
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

        groupMessages[messageIndex] = {
            ...groupMessages[messageIndex],
            ...updatedAttributes
        };

        return this.cache;
    }

    hasLoadedGroup(groupId) {
        return !!this.cache[groupId];
    }

    addNew(newMessage) {
        const groupId = newMessage.group_id;
        if (this.cache[groupId]) {
            this.cache[groupId].unshift(newMessage);
        }
    }

    addNewToThread(newMessage) {
        const groupId = 0;
        if (this.cache[groupId] && !this.cache[groupId].find(message => message.id === newMessage.id)) {
            this.cache[groupId].unshift(newMessage);
        }
    }

    deleteMessage(groupId, messageId) {
        const groupMessages = this.cache[groupId];

        if (!groupMessages) {
            return null;
        }

        const messageIndex = groupMessages.findIndex(m => m.id === messageId);

        if (messageIndex === -1) {
            return null;
        }

        return groupMessages.splice(messageIndex, 1);
    }
}

export default MessageCache;