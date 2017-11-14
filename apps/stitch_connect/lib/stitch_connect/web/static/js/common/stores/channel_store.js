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
    const channel = this.join(this.eventChannelTopic, options);

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

    return channel;
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
    const channel = this.join(this.groupChannelTopic, options);

    return channel;
  }

  // ///////////////// //
  // TeamLobby Channel //
  // ///////////////// //
  get teamLobbyChannel() {
    return this.channels[this.rootStore.presenceStore.teamLobbyChannelTopic];
  }

  joinTeamLobbyChannel(options = {}) {
    return this.join(
      this.rootStore.presenceStore.teamLobbyChannelTopic,
      options
    );
  }

  leaveAllChannelsButTeamLobby() {
    Object.keys(this.channels)
      .filter(
        topic => topic !== this.rootStore.presenceStore.teamLobbyChannelTopic
      )
      .forEach(topic => this.channels[topic].leave());
  }
}

export default ChannelStore;
