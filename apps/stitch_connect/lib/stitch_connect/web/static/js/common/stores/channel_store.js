class ChannelStore {
  channels = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  /**
   * Joins to the channel
   * 
   * @param {String} topic 
   * @param {Object} options 
   */
  join(topic, options = {}) {
    if (this.channels[topic]) {
      this.channels[topic].leave();
    }

    this.channels[topic] = socket.channel(topic, options);

    return this.channels[topic].join();
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
    const { sidemenuStore, userStore } = this.rootStore;
    const joined = this.join(this.eventChannelTopic, options);

    this.eventChannel.on("user_info", userStore.onUpdateUser);
    this.eventChannel.on("new_group", sidemenuStore.onNewGroup);
    this.eventChannel.on("joined_group", sidemenuStore.onJoinedGroup);
    this.eventChannel.on("left_group", sidemenuStore.onLeftGroup);
    this.eventChannel.on("group_renamed", sidemenuStore.onRenameGroup);

    this.eventChannel.on("new_message", sidemenuStore.onNewMessage);
    this.eventChannel.on("new_app_version", () => {
      window.location.reload(true); // force reload without cache
    });
    this.eventChannel.on("logout", ({ session_id: sessionId }) => {
      if (window.sessionId === sessionId) {
        window.location.reload();
      }
    });

    return joined;
  }

  // ///////////// //
  // Group Channel //
  // ///////////// //
  get groupChannelTopic() {
    const { groupStore } = this.rootStore;

    return `groups:${groupStore.slug}`;
  }

  get groupChannel() {
    return this.channels[this.groupChannelTopic];
  }

  joinGroupChannel(options = {}) {
    const joined = this.join(this.groupChannelTopic, options);

    return joined;
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
    const { presenceStore } = this.rootStore;

    const joined = this.join(this.teamChannelTopic, options);

    this.teamChannel.on("presence_state", presenceStore.onPresenceState);
    this.teamChannel.on("presence_diff", presenceStore.onPresenceDiff);
    this.teamChannel.on("locked", presenceStore.onLocked);
    this.teamChannel.on("unlocked", presenceStore.onUnlocked);

    return joined;
  }

  leaveAllChannelsButTeamLobby() {
    Object.keys(this.channels)
      .filter(topic => topic !== this.teamChannelTopic)
      .forEach(topic => this.channels[topic].leave());
  }
}

export default ChannelStore;
