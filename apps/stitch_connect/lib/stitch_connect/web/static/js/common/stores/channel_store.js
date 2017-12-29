/**
 * Channel store
 *
 * This store is the central hub for socket channels that are used across the app.
 * All socket channels used in the app MUST be registered in this store.
 */

class ChannelStore {
  channels = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  /**
   * Joins the channel topic
   *
   * @param {string} topic
   * @param {Object} options
   */
  join(topic, options = {}) {
    this.leave(topic);

    this.channels[topic] = socket.channel(topic, options);

    return this.channels[topic].join();
  }

  /**
   * Leaves the channel topic
   *
   * @param {string} topic
   */
  leave(topic) {
    if (this.channels[topic]) {
      this.channels[topic].leave();

      delete this.channels[topic];
    }
  }

  // ///////////// //
  // Event Channel //
  // ///////////// //
  get eventChannelTopic() {
    return `events:${currentUser.id}`;
  }

  get eventChannel() {
    return this.channels[this.eventChannelTopic];
  }

  joinEventChannel(options = {}) {
    const { sidemenuStore, groupsStore } = this.rootStore;
    const joined = this.join(this.eventChannelTopic, options);

    // Message related
    this.eventChannel.on("new_message", sidemenuStore.onNewMessage);

    // Group related
    this.eventChannel.on("created_group", groupsStore.onCreatedGroup);
    this.eventChannel.on("joined_group", groupsStore.onJoinedGroup);
    this.eventChannel.on("left_group", groupsStore.onLeftGroup);
    this.eventChannel.on("renamed_group", groupsStore.onRenamedGroup);
    this.eventChannel.on("hid_group", groupsStore.onHidGroup);
    this.eventChannel.on("marked_as_read", groupsStore.onMarkedAsRead);
    this.eventChannel.on("marked_as_unread", groupsStore.onMarkedAsUnread);
    this.eventChannel.on("members_updated", groupsStore.onMembersUpdated);
    this.eventChannel.on("group_favorite", groupsStore.onFavoriteChanged);

    // App related
    this.eventChannel.on("new_app_version", () => {
      window.location.reload(true); // force reload without cache
    });
    this.eventChannel.on("logout", ({ session_id: sessionId }) => {
      if (window.sessionId === sessionId) {
        window.location = "/logged-out";
      }
    });

    return joined;
  }

  // ///////////// //
  // Group Channel //
  // ///////////// //
  get groupChannelTopic() {
    const { groupStore } = this.rootStore;

    return `groups:${groupStore.group.slug}`;
  }

  get groupChannel() {
    return this.channels[this.groupChannelTopic];
  }

  joinGroupChannel(options = {}) {
    const { messageStore, groupPresenceStore } = this.rootStore;

    const joined = this.join(this.groupChannelTopic, options);

    // Message related
    this.groupChannel.on("new_msg", messageStore.onNewMessage);
    this.groupChannel.on("edit_msg", messageStore.onEditMessage);
    this.groupChannel.on("delete_msg", messageStore.onDeleteMessage);
    this.groupChannel.on("starred_message", messageStore.onStarredMessage);
    this.groupChannel.on("pinned_message", messageStore.onPinnedMessage);
    this.groupChannel.on(
      "msg_link_previews_generated",
      messageStore.onLinkPreviewGenerated
    );
    this.groupChannel.on(
      "msg_link_preview_deleted",
      messageStore.onLinkPreviewDeleted
    );
    this.groupChannel.on("reactions_updated", messageStore.onReactionUpdate);
    this.groupChannel.on("read_status_update", messageStore.onReadStatusUpdate);

    // Group Presence related
    this.groupChannel.on("presence_state", groupPresenceStore.onPresenceState);
    this.groupChannel.on("presence_diff", groupPresenceStore.onPresenceDiff);

    return joined;
  }

  leaveGroupChannel() {
    this.leave(this.groupChannelTopic);
  }

  // //////////// //
  // Team Channel //
  // //////////// //
  get teamChannelTopic() {
    const { presenceStore } = this.rootStore;

    return `team:lobby:${presenceStore.teamId}`;
  }

  get teamChannel() {
    return this.channels[this.teamChannelTopic];
  }

  joinTeamChannel(options = {}) {
    const { presenceStore, sidemenuStore, usersStore } = this.rootStore;

    const joined = this.join(this.teamChannelTopic, options);

    this.teamChannel.on("presence_state", presenceStore.onPresenceState);
    this.teamChannel.on("presence_diff", presenceStore.onPresenceDiff);
    this.teamChannel.on("locked", presenceStore.onLocked);
    this.teamChannel.on("unlocked", presenceStore.onUnlocked);
    this.teamChannel.on(
      "security_lockout_updated",
      presenceStore.onLockoutSettingsLoaded
    );

    this.teamChannel.on("team_renamed", sidemenuStore.onTeamRenamed);

    this.teamChannel.on("user_joined", usersStore.onUserJoined);
    this.teamChannel.on("user_info", usersStore.onUserInfo);

    this.teamChannel.on("user_deactivated", usersStore.onUserDeactivated);
    this.teamChannel.on("user_activated", usersStore.onUserActivated);

    return joined;
  }

  leaveAllChannelsButTeam() {
    Object.keys(this.channels)
      .filter(topic => topic !== this.teamChannelTopic)
      .forEach(topic => {
        this.leave(topic);
      });
  }
}

export default ChannelStore;
