class ChannelStore {
  groupChannelTopic = ""; // groupChannelTopic points to current group channel. used to leave the channel before joining a new.
  channels = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  join(topic, options = {}) {
    if (this.channels[topic]) {
      this.channels[topic].leave();
    }

    this.channels[topic] = socket.channel(topic, options);

    return this.channels[topic].join();
  }

  get eventChannelTopic() {
    return `events:${currentUser.id}`;
  }

  joinEventChannel(options = {}) {
    const channel = this.join(this.eventChannelTopic, options);

    this.eventChannel.on("new_group", this.rootStore.sidemenuStore.onNewGroup);
    this.eventChannel.on(
      "new_message",
      this.rootStore.sidemenuStore.onNewMessage
    );

    return channel;
  }

  get eventChannel() {
    return this.channels[this.eventChannelTopic];
  }

  joinGroupChannel(options = {}) {
    if (this.groupChannelTopic) {
      this.channels[this.groupChannelTopic].leave();
    }
    this.groupChannelTopic = this.rootStore.groupStore.channelTopic;
    return this.join(this.rootStore.groupStore.channelTopic, options);
  }

  get groupChannel() {
    return this.channels[this.rootStore.groupStore.channelTopic];
  }

  joinTeamLobbyChannel(options = {}) {
    return this.join(
      this.rootStore.presenceStore.teamLobbyChannelTopic,
      options
    );
  }

  get teamLobbyChannel() {
    return this.channels[this.rootStore.presenceStore.teamLobbyChannelTopic];
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
