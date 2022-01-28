/**
 * Message store
 *
 * This store keps track of data that are related with messages in the current group
 */

import { observable, action, computed, when } from "mobx";
import moment from "moment";

import debounce from "lodash/debounce";
import last from "lodash/last";
import memoize from "lodash/memoize";
import pickBy from "lodash/pickBy";
import throttle from "lodash/throttle";
import unionBy from "lodash/unionBy";

import { scroller } from "react-scroll";
import { Promise } from "es6-promise";
import shortid from "shortid";
import {
    START_TYPING_THROTTLE_MS,
    MAX_MESSAGE_COUNT_PER_BATCH
} from "lib/constants";
import BaseMessageStore from "common/abstract-stores/base-message-store";
import MessageCache from "./message_cache";
import uniqBy from "lodash/uniqBy";

class MessageStore extends BaseMessageStore {
    @observable message = {};
    @observable messageVisibility = {}; // current visibility status of messages

    @observable jumpMode = false; // indicates if message list is currently at jumping mode
    @observable isJumpLoaded = false; // indicates if surrounded messages are loaded

    @observable groupCursor = null;

    // Message loading status
    @observable loadedInitialMessages = false; // If TRUE, indicates whether messages are loaded for the first time
    @observable loadedInitial = false; // If TRUE, indicates joined the chat channel and loaded the latest messages
    @observable loadedAll = false; // If TRUE, indicates that there is no more old messages to load from server
    @observable loadedAllRecent = false; // If TRUE, indicates that there is no more recent messages to load from server
    @observable loadedAround = new Map(); // { message_id: true } indicates if messages around the jumped message is loaded

    @observable isLoadingRecent = false;
    @observable isLoadingPast = false;
    @observable isScrollBottom = false; // TRUE if reached to the bottom scroll of chat div, otherwise FALSE

    @observable highlightId = null; // message will be highlighted
    @observable infoModalMessageId = null; // info modal will be displayed for this id

    messageTemp = null; // when switching to jumpm mode, stores current messages here so that we can restore them when use his `recent messages`

    // mobx when() monitor disposers
    joinedTargetGroupDisposer = null; // Disposer of when() monitor that waits until joined the group to which jumping target message belongs to
    mountedTargetMessageDisposer = null; // Disposer of when() monitor that waits until target messages is mounted

    readStatusCache = {}; // cache to store read status for when readstatus broadcast arrives before new_msg
    loadedGroupId = null; // indicates joined group id. populated after onJoinedGroup is run. It's to prevent onJoinedGroup happen again by rejoining internally in pheonix_socket.js
    @observable syncedTime = false; // sends timestamp only after synced time

    messageCache = new MessageCache();

    // ////////////// //
    //    GETTERS     //
    // ////////////// //

    // Return the message that is immediately after the timestamp given, but not temp message
    getMessageAfterTimestamp = timestamp => {
        let index = this.messages.findIndex(m => m.inserted_at < timestamp) - 1;
        let message = null;

        while (index >= 0) {
            // Messages that has status set are the temp ones
            if (!this.messages[index].status &&
                this.messages[index].type !== "system"
            ) {
                message = this.messages[index];
                break;
            }

            index -= 1;
        }

        return message;
    };

    get groupChannel() {
        const { channelStore } = this.rootStore;

        return channelStore.groupChannel;
    }

    get eventChannel() {
        const { channelStore } = this.rootStore;

        return channelStore.eventChannel;
    }

    get group() {
        const { groupsStore } = this.rootStore;

        return groupsStore.currentGroup;
    }

    get unreadMessagesCount() {
        return this.group.unread_messages_count;
    }

    get mentionsCount() {
        return this.group.mentions_count;
    }

    get lastReadAt() {
        return this.group.last_read_at;
    }

    // Timestamp that the new message line should appear at
    get newMessageLineAt() {
        return this.group.new_message_line_at;
    }

    get groupMarkedAsUnread() {
        return this.group.marked_as_unread;
    }

    @computed
    get infoMessage() {
        return this.getMessageById(this.infoModalMessageId);
    }

    @computed
    get normalMessages() {
        return this.messages.filter(m => m.type !== "system");
    }

    @computed
    get otherUserMessages() {
        return this.messages.filter(
            m => m.user_id !== currentUser.id && m.type !== "system"
        );
    }

    @computed
    get firstUnreadMessage() {
        const result = this.getMessageAfterTimestamp(this.lastReadAt);
        const messageBeforeLast = this.messages.find(
            m => m.inserted_at < this.lastReadAt
        );

        if (!result && !messageBeforeLast && this.loadedAll) {
            return last(this.otherUserMessages);
        }

        return result;
    }

    @computed
    get lastOtherUserMessage() {
        return this.messages.find(m => m.user_id !== currentUser.id) || {};
    }

    get isActive() {
        return (
            this.rootStore.presenceStore.isActive &&
            this.rootStore.presenceStore.hasFocus
        );
    }

    isCurrentChannelPayload(payload) {
        return payload.group_id === this.group.id;
    }

    /**
     * Returns the position of first unread message in chat div
     *
     * Possible return values are:
     *  'hidden-up': message is hidden in up the chat div
     *  'visible': message is visible
     *  'hidden-down': message is hidden in down the chat div
     */
    @computed
    get firstUnreadMessageVisibility() {
        if (!this.firstUnreadMessage || !this.loadedInitial || !this.groupCursor) {
            return "hidden-up";
        }

        const messageElement = this.messageElements[this.firstUnreadMessage.id];
        if (!messageElement) {
            return "hidden-up";
        }

        if (this.messageVisibility[this.firstUnreadMessage.id]) {
            return "visible";
        }

        return this.firstUnreadMessage.id < this.groupCursor ?
            "hidden-up" :
            "hidden-down";
    }

    @computed
    get newMessageLineMessage() {
        const result = this.getMessageAfterTimestamp(this.newMessageLineAt);

        const messageBeforeLast = this.messages.find(
            m => m.inserted_at < this.newMessageLineAt
        );

        if (!result && !messageBeforeLast && this.loadedAll) {
            return last(this.otherUserMessages);
        }

        return result;
    }

    @computed
    get messagesByDate() {
        return this.groupMessagesByDate(this.messages);
    }

    @computed
    get starredMessages() {
        return this.messages.filter(message => message.starred);
    }

    /**
     * Returns TRUE if all the message divs are mounted
     */
    @computed
    get mountedAllMessages() {
        return (
            this.normalMessages.length === 0 ||
            (this.normalMessages.length > 0 &&
                this.mountedMessages.length === this.normalMessages.length)
        );
    }

    /**
     * If TRUE, indicates jumped-message-indicator should show up
     */
    @computed
    get showJumpedMessageIndicator() {
        return this.jumpMode && !this.loadedAllRecent;
    }

    // ////////////// //
    //    METHODS     //
    // ////////////// //

    reset(options = {}) {
        this.jumpMode = false;
        this.isJumpLoaded = false;
        this.loadedAll = false;
        this.loadedAllRecent = false;

        this.loadedInitial = false;
        if (options.withMessages) {
            this.messages = [];
        }
        this.messageElements = {};
        this.messageInEdit = null;

        this.infoModalMessageId = null;
        this.textInEdit = "";
        this.readStatusCache = {};
        this.messageVisibility = {};
        this.mountedMessages = [];
        this.timeoutManager.reset();

        if (this.group) {
            this.updateGroupData({
                marked_as_unread: false,
                new_message_line_at: this.lastReadAt
            });
        }
    }

    @action
    updateGroupData(data) {
        const { groupsStore } = this.rootStore;
        const allowedKeys = [
            "unread_messages_count",
            "mentions_count",
            "last_read_at",
            "marked_as_unread",
            "new_message_line_at"
        ];
        const updates = pickBy(data, (value, key) => allowedKeys.includes(key));

        // Update group info
        groupsStore.updateGroupData(this.group.id, updates);
    }

    @action
    updateGroupCursor(cursor) {
        const { groupsStore } = this.rootStore;

        this.groupCursor = cursor;

        groupsStore.updateGroupCursor(this.group.id, cursor);
    }

    @action
    scrollToNewBanner = () => {
        // If unread messages remain, scroll to top,
        // otherwise just scroll to new banner
        if (this.firstUnreadMessage) {
            scroller.scrollTo("newMessageBanner", {
                containerId: "chat",
                smooth: true,
                duration: 500,
                offset: -50
            });
        } else {
            scroller.scrollTo("topPosition", {
                containerId: "chat",
                smooth: true,
                duration: 500,
                offset: -50
            });
        }
    };

    /**
     * Given the group id, checks whether the message store has cached the group
     * @param {Integer} groupId
     * @returns {Boolean}
     */
    hasCachedGroup(groupId) {
        return this.messageCache.hasLoadedGroup(groupId);
    }

    /**
     * Scroll to a specific message in chat div
     *
     * @param {Integer} messageId ID of message to scroll to
     */
    centerMessage(messageId) {
        const messageElement = this.messageElements[messageId];

        // If message is not mounted yet, return
        if (!messageElement) {
            return;
        }

        // Scroll only when message is not visible
        const offset =
            (this.chatDiv.offsetHeight - messageElement.div.offsetHeight) / 2;

        this.scrollTo(messageId, 0, null, -offset);

        // Highlight the message jumped to by fading out for 3 seconds
        this.highlightMessage(messageId);
    }

    @action
    highlightMessage = (id, duration = 3000) => {
        if (this.highlightTimeout) {
            this.timeoutManager.clearTimeout(this.highlightTimeout);
        }

        // required for animation restart
        this.highlightId = null;
        this.timeoutManager.setTimeout(() => {
            this.highlightId = id;
        }, 0);

        this.highlightTimeout = this.timeoutManager.setTimeout(() => {
            this.highlightId = null;
        }, duration);
    };

    /**
     * Jump to the specific message
     * The workflow is as following:
     *  1. Ensures that joined the group which target message belongs to.
     *    1.1. If already joined the target group, goes to Step 2.
     *    1.2. If not joined, waits until joined. Switching group is triggered by URL change.
     *      1.2.1. When joined the target group, goes to Step 2.
     *  2. Ensures that target message is mounted.
     *    2.1. If target message is mounted already, goes to Step 3.
     *    2.2. If not, keeps loading the old messages from server until target message is met.
     *      2.2.1. When target message is mounted, goes to Step 3.
     *  3. Scroll to the target message element
     *
     * @param {Object} targetMessage
     */
    @action
    jumpToMessage(targetMessage) {
        // check if target message is already loaded
        const msg = this.getMessageById(targetMessage.id);
        if (msg) {
            this.centerMessage(msg.id);
            return;
        }

        if (this.joinedTargetGroupDisposer) {
            this.joinedTargetGroupDisposer();
        }

        // Ensure that joined the group to which target message belongs
        this.joinedTargetGroupDisposer = when(
            () => targetMessage.group_id === this.group.id && this.loadedInitial,
            () => {
                // Ensure that target message is mounted
                if (this.mountedTargetMessageDisposer) {
                    this.mountedTargetMessageDisposer();
                }

                this.mountedTargetMessageDisposer = when(
                    () => this.loadedAround.get(targetMessage.id),
                    () => {
                        this.centerMessage(targetMessage.id);
                    }
                );

                // Load until target message is loaded
                this.loadJumpedMessage(targetMessage);
            }
        );
    }

    /**
     * Load messages around targetMessage
     *
     * @param {Object} targetMessage
     */
    loadJumpedMessage(targetMessage) {
        // temporarily move messages
        this.messageTemp = this.messages.slice(0);
        this.messages = [targetMessage];
        this.loadedAround.set(targetMessage.id, false);
        this.loadedAll = false;
        this.loadedAllRecent = false;
        this.jumpMode = true;
        this.isJumpLoaded = false;
        this.messageInEdit = null;
        this.textInEdit = "";

        // load messages around it
        Promise.all([
            this.loadPastMessages(false),
            this.loadRecentMessages(false)
        ]).then(() => {
            this.isJumpLoaded = true;
            this.loadedAround.set(targetMessage.id, true);
        });
    }

    switchFromJumpMode() {
        this.messages = this.messageTemp.slice(0);
        this.jumpMode = false;
        this.scrollToBottom();
    }

    @action
    markAsUnread = messageId => {
        post(`/api/v1/groups/${this.group.id}/mark_as_unread`, {
            body: {
                message_id: messageId
            }
        });
    };

    /**
     * Mark group messages as read
     *
     * @param resetNewMessageLine   IF True, reset newMessageLineAt to null, thus making it depend on lastReadAt,
     *                              Otherwise, store the current lastReadAt timestamp at as newMessageLineAt
     */
    @action
    markAsRead = (resetNewMessageLine = true) => {
        const { groupStore } = this.rootStore;
        // Set the unread messages info in optimistic
        //
        // last_read_at: lastest message's timestamp + 1ms
        // unread_messages_count: 0
        // mentions_count: 0
        //
        // These info will be updated with real value when `marked_as_read` event is broadcast
        this.updateGroupData({
            last_read_at: moment
                .utc(this.messages.length ? this.messages[0].inserted_at : new Date())
                .add(1, "millisecond")
                .format("YYYY-MM-DDTHH:mm:ss.SSS"),
            unread_messages_count: 0,
            mentions_count: 0
        });

        if (resetNewMessageLine) {
            this.updateGroupData({ new_message_line_at: this.lastReadAt });
        }

        if (groupStore.group.joined) {
            post(`/api/v1/groups/${this.group.id}/mark_as_read`);
        }
    };

    // returns the same debouncedMarkAsRead if the
    // same arguments are passed in. If different args
    // are passed in, a new debouncedMarkAsRead comes out
    // (so you can debounce marking for one group, but
    // it does not affect any others)
    getDebouncedMarkAsRead = memoize(() => {
        return debounce(this.markAsRead, 500, {
            maxWait: 1200, // above the timeout for the initial mark as read
            leading: true
        });
    });

    sendMessage = (text, additionalFields = {}) => {
        if (this.jumpMode) {
            this.switchFromJumpMode();
        }

        const messageText = this.encodeMessage(text);
        const tempMessage = this.generateTempMessage(messageText);
        // Add temp message
        this.messages.unshift(tempMessage);
        // Scroll to bottom
        this.scrollToBottom(null, 0, 0);

        const newMsg = {
            text_content: messageText,
            request_id: tempMessage.id,
            ...additionalFields
        };

        if (this.syncedTime) {
            newMsg.timestamp = new Date().getTime(); // sending unix timestamp in milliseconds to calc latency on server
        }

        post(`/api/v1/groups/${this.group.id}/messages`, {
            body: {
                message: newMsg,
                authenticated_urls: true
            }
        }).catch(() => {
            this.updateMessageData(tempMessage.id, tempMessage.group_id, {
                status: "failed"
            });
        });

        this.startTyping.flush(); // flushing throttle
    };

    @action
    deleteLinkPreview = (messageId, link) => {
        return new Promise((resolve, reject) => {
            this.groupChannel
                .push("delete_msg_link_preview", {
                    message_id: messageId,
                    link
                })
                .receive("ok", resolve)
                .receive("error", err => {
                    notify.show(err.message, "error");
                    reject(err);
                });
        });
    };

    @action
    loadPastUnreadMessages = () => {
        this.loadPastMessages().then(this.scrollToNewBanner);
    };

    @action
    loadPastMessages = (stayScroll = true) => {
        return new Promise((resolve, reject) => {
            if (
                this.loadedAll ||
                !this.messages.length ||
                !this.loadedInitial ||
                this.isLoadingPast
            ) {
                resolve();
                return;
            }
            this.isLoadingPast = true;
            get(
                    `/api/v1/groups/${this.group.id}/messages?fetchUsers=false&max_id=${this
          .messages[this.messages.length - 1].id}&authenticated_urls=true`
                )
                .then(response => {
                    const users = this.rootStore.usersStore.users.toJS();
                    const messages = response.data.map(msg => ({
                        ...msg,
                        user: users.find(u => u.id === msg.user_id)
                    }));
                    this.isLoadingPast = false;

                    if (!messages.length) {
                        this.loadedAll = true;
                        resolve();
                        return;
                    }

                    if (messages.length < MAX_MESSAGE_COUNT_PER_BATCH) {
                        this.loadedAll = true;
                    }

                    this.messages.push(...messages);

                    if (stayScroll) {
                        when(
                            () => !this.isLoadingPast,
                            () => {
                                this.timeoutManager.setTimeout(() => {
                                    this.scrollTo(messages[0].id, 0, () => {
                                        resolve();
                                    });
                                }, 100);
                            }
                        );
                    } else {
                        resolve();
                    }
                })
                .catch(err => {
                    this.isLoadingPast = false;
                    reject(err);
                    notify.show(err.message, "error");
                });
        });
    };

    @action
    loadRecentMessages = (stayScroll = true) => {
        return new Promise((resolve, reject) => {
            if (this.loadedAllRecent || this.isLoadingRecent) {
                resolve();
                return;
            }

            this.isLoadingRecent = true;

            get(
                    `/api/v1/groups/${this.group
          .id}/feed_recent?fetchUsers=false&min_id=${this.messages[0].id}`
                )
                .then(response => {
                    const users = this.rootStore.usersStore.users.toJS();
                    const messages = response.data.map(msg => ({
                        ...msg,
                        user: users.find(u => u.id === msg.user_id)
                    }));
                    this.isLoadingRecent = false;
                    if (!messages.length) {
                        this.jumpMode = false;
                        this.loadedAllRecent = true;
                        resolve();
                        return;
                    }

                    if (messages.length < MAX_MESSAGE_COUNT_PER_BATCH) {
                        this.loadedAllRecent = true;
                    }

                    this.messages.unshift(...messages.reverse());

                    if (stayScroll) {
                        when(
                            () => this.mountedAllMessages,
                            () => {
                                // stay at the position
                                this.scrollTo(messages[messages.length - 1].id, 0, () => {
                                    resolve();
                                });
                            }
                        );
                    } else {
                        resolve();
                    }
                })
                .catch(err => {
                    this.isLoadingRecent = false;
                    reject(err);
                    notify.show(err.message, "error");
                });
        });
    };

    handleInitialLoading = (cached = false) => {
        const cb = () => {
            this.loadedInitialMessages = true;
            this.loadedInitial = true;

            this.updateGroupCursor(null);
        };

        if (this.firstUnreadMessage) {
            this.scrollTo(this.firstUnreadMessage.id, 0, cb);
        } else if (cached) {
            // If the group is cached, do not use default timeout, which delays the room switch by 300ms.
            this.scrollToBottom(cb, 10, 10);
        } else {
            this.scrollToBottom(cb);
        }
    };

    @action
    finishEdit() {
        if (!this.messageInEdit) {
            return;
        }

        this.startTyping.flush(); // flushing throttle

        const trimmedEditText = this.textInEdit.trim();

        if (!trimmedEditText ||
            this.messageInEdit.text_content === trimmedEditText
        ) {
            this.cancelEdit();
            return;
        }

        this.groupChannel.push("edit_msg", {
            message_id: this.messageInEdit.id,
            params: {
                text_content: this.encodeMessage(trimmedEditText)
            }
        });
    }

    @action
    delete(id) {
        const message = this.getMessageById(id, true);

        if (message) {
            this.groupChannel.push("delete_msg", { message_id: id });
        }
    }

    @action
    toggleStar(id) {
        const message = this.getMessageById(id, true);

        if (message) {
            post(`/api/v1/messages/${id}/toggle-star`);
        }
    }

    @action
    togglePin(id) {
        const message = this.getMessageById(id, true);

        if (message) {
            post(`/api/v1/messages/${id}/toggle-pin`);
        }
    }

    startTyping = throttle(
        () => {
            this.groupChannel.push("is_typing");
        },
        START_TYPING_THROTTLE_MS, { leading: true }
    );

    generateTempMessage = text => {
        // generates unique temporary request ID
        const tempId = shortid.generate();

        return {
            // Temp attributes
            id: tempId,
            status: "sending",
            inserted_at: moment.utc().format("YYYY-MM-DDTHH:mm:ss.SSS"),

            user: currentUser,
            type: "chat",
            text_content: text,
            group_id: this.group.id,
            user_id: currentUser.id
        };
    };

    @action
    toggleReaction = (messageId, emoji) => {
        this.groupChannel.push("toggle_reaction", {
            message_id: messageId,
            emoji_name: emoji
        });
    };

    @action
    syncTime = () => {
        this.syncedTime = false;
        this.groupChannel
            .push("sync_time", {
                timestamp: new Date().getTime()
            })
            .receive("ok", () => {
                this.syncedTime = true;
            });
    };

    // ////////////// //
    // EVENT HANDLERS //
    // ////////////// //

    @action
    onJoinGroupChannelCached = () => {
        this.messages = this.messageCache.getCache(this.group.id);
        this.loadedGroupId = this.group.id;
        if (this.messages.length < MAX_MESSAGE_COUNT_PER_BATCH) {
            this.loadedAll = true;
        }
        when(() => this.mountedAllMessages, () => this.handleInitialLoading(true));
    };

    @action
    onJoinGroupChannel = data => {
        // sync time as soon as joined to the channel
        this.syncTime();

        if (this.group.id === this.loadedGroupId) {
            // // new message has more precedance by putting it as first param.
            this.messageCache = new MessageCache();
            this.messages = unionBy(data.messages, this.messages, msg => {
                return msg.request_id || msg.id; // if temporary message, merge by request_id. Otherwise, merge by msg id
            });
            this.messageCache.addBatchToCache(this.group.id, this.messages);
        } else if (this.messageCache.hasLoadedGroup(this.group.id)) {
            this.messages = this.messageCache.getCache(this.group.id);
        } else {
            this.messages = data.messages;
            this.messageCache.addBatchToCache(this.group.id, data.messages);
        }

        if (data.messages.length < MAX_MESSAGE_COUNT_PER_BATCH) {
            this.loadedAll = true;
        }

        this.loadedGroupId = this.group.id;

        when(() => this.mountedAllMessages, this.handleInitialLoading);
    };

    @action
    onScrollTopReached() {
        // no loading of past message if jumping surrounded msgs are not loaded yet
        if (this.jumpMode && !this.isJumpLoaded) {
            return;
        }

        this.loadPastMessages();
    }

    @action
    onScrollBottomReached() {
        if (this.jumpMode && !this.loadedAllRecent) {
            this.loadRecentMessages();
        } else {
            this.isScrollBottom = true;
        }
    }

    @action
    onScrollBottomLeft() {
        this.isScrollBottom = false;
    }

    @action
    onWindowFocus() {
        // if last message is visible, mark as unread
        if (
            this.group &&
            this.firstUnreadMessage &&
            this.messageVisibility[this.firstUnreadMessage.id]
        ) {
            this.timeoutManager.setTimeout(() => {
                this.markAsRead(false);
            }, 1000);
        }
    }

    onMessageShow = id => {
        this.messageVisibility[id] = true;

        if (!this.groupCursor || this.groupCursor > id) {
            this.updateGroupCursor(id);
        }

        // just ignore message show if window lost focus
        if (!this.isActive) {
            return;
        }

        const isFirstMsgVisible =
            this.firstUnreadMessage &&
            this.mountedAllMessages &&
            this.messageVisibility[this.firstUnreadMessage.id];

        // If first unread message is visible, mark messages as read after 1s delay
        // but, leave the new message line
        if (!this.groupMarkedAsUnread && isFirstMsgVisible) {
            // for each group.id return a new debounced markAsRead
            // so that you dont accidentally debounce setting a different
            // group to unread (switching active group and re-scrolling quickly)
            const debouncedMarkAsRead = this.getDebouncedMarkAsRead(this.group.id);

            this.timeoutManager.setTimeout(() => {
                debouncedMarkAsRead(false);
            }, 1000);
        }
    };

    onMessageHide = id => {
        if (this.messageElements[id]) {
            this.messageVisibility[id] = false;
        }

        if (!this.groupCursor || this.groupCursor === id) {
            const index = this.messages.findIndex(m => m.id === id);
            if (index > 0) {
                this.updateGroupCursor(this.messages[index - 1].id);
            }
        }
    };

    @action
    onNewMessage = newMessage => {
        const { sidemenuStore, groupStore } = this.rootStore;

        if (newMessage.group_id !== this.group.id) {
            this.messageCache.addNew(newMessage.group_id, newMessage);

            return;
        }

        if (
            this.getMessageById(newMessage.request_id) && // request_id is now attached to every message, so we should check if temp message exists
            newMessage.user_id === currentUser.id
        ) {
            // update message if it's temporary
            this.updateMessageData(newMessage.request_id, newMessage.group_id, {
                ...newMessage,
                read_status: {
                    // set read status with cached status
                    ...newMessage.read_status,
                    ...this.readStatusCache[newMessage.id]
                },
                status: undefined
            });

            this.onMessageUnmounted(newMessage.request_id);

            // clear read status cache for new message arrived
            if (this.readStatusCache[newMessage.id]) {
                delete this.readStatusCache[newMessage.id];
            }
        } else {
            // otherwise, add to message list
            this.messages.unshift(newMessage);
            this.messageCache.addNew(newMessage.group_id, newMessage);
        }

        // Update unread messages info of the group.
        // Only mark as read when the app has user's focus
        if (
            this.isActive &&
            this.unreadMessagesCount === 0 &&
            (newMessage.user_id === currentUser.id || this.isScrollBottom)
        ) {
            this.markAsRead(true);
        } else if (
            newMessage.type !== "system" &&
            newMessage.user_id !== currentUser.id
        ) {
            const isMention = newMessage.mentioned_user_ids.includes(currentUser.id);

            this.updateGroupData({
                unread_messages_count: this.unreadMessagesCount + 1,
                mentions_count: this.mentionsCount + (isMention ? 1 : 0)
            });
        }

        // if the user is scrolled to the bottom, keep scrolling down when receiving new message
        if (this.isScrollBottom || newMessage.user_id === currentUser.id) {
            this.scrollToBottom(null, 0, 0);
        }

        // Update favicon
        sidemenuStore.updateFavicon();

        // Show notification card
        sidemenuStore.showNotificationCardForNewMessage(newMessage);

        // Remove the sender of message from typing list immediately after message arrives
        if (newMessage.user_id && newMessage.user_id !== currentUser.id) {
            groupStore.stoppedTyping(newMessage.user_id);
        }
    };

    @action
    onUpdateMessage = updatedMessage => {
        if (updatedMessage.group_id !== this.group.id) {
            return;
        }

        this.updateMessageData(updatedMessage.id, updatedMessage.group_id, {
            fields: updatedMessage.fields,
            text_content: updatedMessage.text_content
        });
    };

    @action
    onStarredMessage = message => {
        const { globalStarredMessageStore } = this.rootStore;

        // Only process star events for the current user.
        if (message.starred_by_user_id !== currentUser.id) {
            return;
        }

        this.updateMessageData(message.id, message.group_id, {
            starred: message.starred
        });

        if (message.starred) {
            globalStarredMessageStore.add(message);
        } else {
            globalStarredMessageStore.remove(message.id);
        }
    };

    @action
    onPinnedMessage = message => {
        const { pinnedMessageStore } = this.rootStore;

        this.updateMessageData(message.id, message.group_id, {
            pinned: message.pinned,
            pinned_at: message.pinned_at,
            pinned_by: message.pinned_by
        });

        if (message.pinned) {
            pinnedMessageStore.add(message);
        } else {
            pinnedMessageStore.remove(message.id);
        }
    };

    @action
    onFileCommentAdded = payload => {
        const files = this.messages.filter(
            message => message.upload_id === payload.id && message.type === "upload"
        );

        files.forEach(file => {
            this.updateMessageData(file.id, file.group_id, { fields: payload });
        });
    };

    @action
    onFileCommentEdited = payload => {
        const files = this.messages.filter(
            message => message.upload_id === payload.id && message.type === "upload"
        );

        files.forEach(file => {
            this.updateMessageData(file.id, file.group_id, { fields: payload });
        });
    };

    @action
    onPublicLinkUpdate = payload => {
        const files = this.messages.filter(
            message =>
            message.upload_id === payload.upload_id && message.type === "upload"
        );

        files.forEach(file => {
            const fields = {...file.fields, public_url: payload.public_url };
            this.updateMessageData(file.id, file.group_id, { fields });
        });
    };

    @action
    onFileDetailsUpdate = payload => {
        const files = this.messages.filter(
            message =>
            message.upload_id === payload.upload_id && message.type === "upload"
        );

        files.forEach(file => {
            const fields = {...file.fields, public_url: payload.public_url };
            this.updateMessageData(file.id, file.group_id, { fields });
        });
    };

    @action
    onFileDeleted = payload => {
        const files = this.messages.filter(
            message =>
            message.upload_id === payload.upload_id &&
            (message.type === "upload" || message.type === "file_comment")
        );

        files.forEach(file => {
            const messageIndex = this.messages.findIndex(m => m.id === file.id);

            if (messageIndex > -1) {
                this.messages.splice(messageIndex, 1);
            }

            this.messageCache.deleteMessage(file);
        });
    };

    @action
    load(message) {
        return get(`/api/v1/message/${message.id}`).then(response => {
            this.message = response.data;
            return this.message;
        });
        // this.message = message;
        // return this.message;
    }

    @action
    addComment(text) {
        const messageText = this.encodeMessage(text);
        const tempMessage = this.generateTempMessage(messageText);
        const body = { file_comment: { text_content: text, thread: true, request_id: tempMessage.id } };
        console.log(this.message, "messagecomment")
        return post(`/api/v1/files/${this.message.id}/comments`, {
            body,
            hideNotify: true
        }).then(response => {
            this.message.thread_messages = uniqBy([...this.message.thread_messages, response.data], "id");
            console.log(this.message, "messagecomment")
        });
    }

    @action
    updateMessageComment = (commentId, commentText) => {
        const body = { file_comment: { text_content: commentText } };
        return put(`/api/v1/file_comments/${commentId}`, {
            body,
            hideNotify: true
        }).then(response => {
            this.file.comments = this.file.comments.map(
                comment => (comment.id === commentId ? response.data : comment)
            );
        });
    };
}

export default MessageStore;